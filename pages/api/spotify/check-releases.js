import { getArtistsAllAbums, SpotifyArtistInfo } from 'lib/spotify'
import { ArtistInfo, getReleaseInfo } from 'lib/discogs'
import {
	selectAllArtists,
	selectArtistFollowers,
	updateReleaseCount,
	selectUsersByIds,
	insertArtistReleases,
	selectArtistReleases,
	executeTransaction
} from 'lib/db'
import { sendEmail } from 'lib/email'
import {
	daysBetweenDates,
	normalizeApostrophes,
	normalizeDiscogsAlbumTitle,
	normalizeSpotifyAlbumTitle,
	todayDate
} from 'lib/util'

const RELEASE_FRESHNESS_DAYS = 14

export default async (req, res) => {
	if (req.method !== 'GET') return res.status(200).json({ message: 'OK' })

	try {
		const queries = []
		const artistReleases = new Map()

		const artists = await selectAllArtists()
		const artistCount = artists.length
		let artistIdx = 0
		for (const artist of artists) {
			const { name: artistName, spotifyId: artistSpotifyId } = artist

			console.log('----------------------------------------------------------------------------')
			console.log(`${++artistIdx}/${artistCount} ${artistName}`)
			const artistInfo = new ArtistInfo(artistName)
			await artistInfo.init(artist.discogsId)

			const newRelCount = artistInfo.getReleaseCount()
			const prevRelCount = artist.discogsReleaseCount
			const relCountDiff = newRelCount - prevRelCount

			const artistSpotifyInfo = new SpotifyArtistInfo(artistName, artistSpotifyId)
			await artistSpotifyInfo.init()
			const newSpotifyRelCount = artistSpotifyInfo.getReleaseCount()
			const prevSpotifyRelCount = artist.spotifyReleaseCount
			const spotifyRelCountDiff = newSpotifyRelCount - prevSpotifyRelCount

			if (relCountDiff < 1 && spotifyRelCountDiff < 1) {
				continue
			}

			console.log(
				`update release counts: discogs: ${prevRelCount}->${newRelCount}, spotify: ${prevSpotifyRelCount}->${newSpotifyRelCount}`
			)
			queries.push(updateReleaseCount(artistSpotifyId, newRelCount, newSpotifyRelCount))

			const diffReleases = artistInfo.getLatestReleases().slice(0, relCountDiff)
			const thisYearReleases = filterThisYearReleases(diffReleases)

			const allSpotifyAlbums = await getArtistsAllAbums(artistSpotifyId)
			const spotifyReleases = sortByDate(filterSpotifyReleases(artistName, allSpotifyAlbums)).slice(
				0,
				spotifyRelCountDiff
			)

			if (!thisYearReleases.length && !spotifyReleases.length) {
				continue
			}

			const artistLatestReleases = await getArtistNewReleases(
				artistName,
				thisYearReleases,
				allSpotifyAlbums
			)
			const latestReleaseTitles = new Set(artistLatestReleases.map(release => release.title))
			const spotifyOnlyReleases = spotifyReleases.filter(
				release => !latestReleaseTitles.has(release.title)
			)

			if (spotifyOnlyReleases.length) {
				artistLatestReleases.push(...spotifyOnlyReleases)
			}
			const artistNewReleases = await filterExistingReleases(artistLatestReleases, artistName)

			if (artistNewReleases.length) {
				console.log(`${artistName} has ${artistNewReleases.length} new releases`)
				artistReleases.set(artistSpotifyId, artistNewReleases)
				queries.push(insertArtistReleases(artist.id, artistNewReleases))
			}
		}

		if (artistReleases.size) {
			const userReleases = await getReleasesPerUser(artistReleases)
			const users = await selectUsersByIds(...userReleases.keys())
			for (const user of users) {
				console.log(`preparing to send email to ${user.email}`)
				const { id: userId, name, email } = user
				const releases = userReleases.get(userId)
				await sendEmail(name, email, releases)
			}
		}

		if (queries.length) {
			await executeTransaction(queries)
		}
	} catch (error) {
		return res.status(400).json({ message: error.message, stack: error.stack })
	}

	res.status(200).json({ message: 'OK' })
}

const getReleasesPerUser = async artistReleases => {
	const userReleases = new Map()
	for (const artistSpotifyId of artistReleases.keys()) {
		const followers = await selectArtistFollowers(artistSpotifyId)
		for (const follower of followers) {
			const { id: userId } = follower
			const userAllReleases = userReleases.has(userId) ? userReleases.get(userId) : []
			userAllReleases.push(...artistReleases.get(artistSpotifyId))
			userReleases.set(userId, userAllReleases)
		}
	}
	return userReleases
}

const getArtistNewReleases = async (artistName, newReleases, allSpotifyAlbums) => {
	const artistNewReleases = []
	const spotifyAlbumTitles = getSpotifyAlbumTitleIndexes(allSpotifyAlbums)

	for (const newRelease of newReleases) {
		let release = {}
		const discogsAlbum = await getReleaseInfo(newRelease.resource_url)

		const albumTitle = normalizeDiscogsAlbumTitle(newRelease)
		if (spotifyAlbumTitles.has(albumTitle)) {
			const spotifyAlbumIdx = spotifyAlbumTitles.get(albumTitle)
			const spotifyAlbum = allSpotifyAlbums[spotifyAlbumIdx]
			release = createReleaseFromSpotifyAlbum(artistName, spotifyAlbum)
		} else {
			release = createReleaseFromDiscogsAlbum(artistName, discogsAlbum)
		}
		release.genres = discogsAlbum.genres

		if (!release.album_cover) {
			// TODO: set default album cover or retrieve album cover
		}

		if (daysBetweenDates(Date.now(), release.release_date) <= RELEASE_FRESHNESS_DAYS) {
			artistNewReleases.push(release)
		}
	}
	return artistNewReleases
}

const getSpotifyAlbumTitleIndexes = spotifyAlbums => {
	return spotifyAlbums.reduce((spotifyAlbumTitles, album, idx) => {
		const albumTitle = normalizeSpotifyAlbumTitle(album)
		spotifyAlbumTitles.set(albumTitle, idx)
		return spotifyAlbumTitles
	}, new Map())
}

const filterThisYearReleases = releases => {
	return releases.filter(release => release.year === new Date().getFullYear())
}

const filterSpotifyReleases = (artistName, releases) =>
	releases
		.filter(release => daysBetweenDates(Date.now(), release.release_date) <= RELEASE_FRESHNESS_DAYS)
		.filter(release => release.album_type !== 'compilation')
		.filter(release => release.artists[0].name !== 'Various Artists')
		.map(release => ({ genres: [], ...createReleaseFromSpotifyAlbum(artistName, release) }))

const filterExistingReleases = async (releases, artistName) => {
	const artistExistingReleases = await selectArtistReleases(artistName)
	const existingReleaseTitles = new Set(
		artistExistingReleases.map(release => normalizeDiscogsAlbumTitle(release))
	)
	return releases.filter(release => !existingReleaseTitles.has(normalizeDiscogsAlbumTitle(release)))
}

const sortByDate = releases =>
	releases.sort((a, b) => new Date(a.release_date) - new Date(b.release_date) > 0)

const createReleaseFromSpotifyAlbum = (artistName, spotifyAlbum) => {
	return {
		title: normalizeApostrophes(spotifyAlbum.name),
		artists: getArtistsList(artistName, spotifyAlbum.artists),
		release_date: spotifyAlbum.release_date ?? todayDate(),
		album_cover: spotifyAlbum.images?.[0]?.url,
		spotify_url: spotifyAlbum.external_urls.spotify
	}
}

const createReleaseFromDiscogsAlbum = (artistName, releaseInfo) => {
	return {
		title: releaseInfo.title,
		artists: getArtistsList(artistName, releaseInfo.artists),
		release_date: releaseInfo.released ?? todayDate(),
		album_cover: releaseInfo.images?.[0]?.uri,
		discogs_url: releaseInfo.uri
	}
}

const getArtistsList = (mainArtistName, artists) => {
	return [
		mainArtistName,
		...artists.map(artist => artist.name).filter(artist => artist !== mainArtistName)
	]
}
