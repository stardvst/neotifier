import { getArtistsAllAbums, SpotifyArtistInfo } from 'lib/spotify'
import { ArtistInfo, getReleaseInfo } from 'lib/discogs'
import {
	selectAllArtists,
	selectArtistFollowers,
	updateReleaseCount,
	selectUsersByIds,
	insertArtistReleases,
	selectArtistReleases
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
			await updateReleaseCount(artistSpotifyId, newRelCount, newSpotifyRelCount)

			const diffReleases = artistInfo.getLatestReleases().slice(0, relCountDiff)
			const thisYearReleases = filterThisYearReleases(diffReleases)

			const allSpotifyAlbums = await getArtistsAllAbums(artistSpotifyId)
			const spotifyReleases = sortByDate(filterSpotifyReleases(allSpotifyAlbums)).slice(
				0,
				spotifyRelCountDiff
			)

			if (!thisYearReleases.length && !spotifyReleases.length) {
				continue
			}

			const artistLatestReleases = await getArtistNewReleases(thisYearReleases, allSpotifyAlbums)
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
				await insertArtistReleases(artist.id, artistNewReleases)
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
	} catch (error) {
		return res.status(400).json({ message: error })
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

const getArtistNewReleases = async (newReleases, allSpotifyAlbums) => {
	const artistNewReleases = []
	const spotifyAlbumTitles = getSpotifyAlbumTitleIndexes(allSpotifyAlbums)

	for (const newRelease of newReleases) {
		let release = {}
		const releaseInfo = await getReleaseInfo(newRelease.resource_url)
		release.genres = releaseInfo.genres

		const albumTitle = normalizeDiscogsAlbumTitle(newRelease)
		if (spotifyAlbumTitles.has(albumTitle)) {
			const spotifyAlbumIdx = spotifyAlbumTitles.get(albumTitle)
			const spotifyAlbum = allSpotifyAlbums[spotifyAlbumIdx]
			release = { ...release, ...createRelease(spotifyAlbum) }
		} else {
			release.title = releaseInfo.title
			release.artists = releaseInfo.artists.map(artist => artist.name)
			release.release_date = releaseInfo.released ?? todayDate()
			release.album_cover = releaseInfo.images?.[0]?.uri
			release.discogs_url = releaseInfo.uri
		}

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

const filterSpotifyReleases = releases =>
	releases
		.filter(release => daysBetweenDates(Date.now(), release.release_date) <= RELEASE_FRESHNESS_DAYS)
		.filter(release => release.album_type !== 'compilation')
		.filter(release => release.artists[0].name !== 'Various Artists')
		.map(release => ({ genres: [], ...createRelease(release) }))

const filterExistingReleases = async (releases, artistName) => {
	const artistExistingReleases = await selectArtistReleases(artistName)
	const existingReleaseTitles = new Set(artistExistingReleases.map(release => release.title))
	return releases.filter(release => !existingReleaseTitles.has(release.title))
}

const sortByDate = releases =>
	releases.sort((a, b) => new Date(a.release_date) - new Date(b.release_date) > 0)

const createRelease = spotifyAlbum => {
	return {
		title: normalizeApostrophes(spotifyAlbum.name),
		artists: spotifyAlbum.artists.map(artist => artist.name),
		release_date: spotifyAlbum.release_date ?? todayDate(),
		album_cover: spotifyAlbum.images?.[0]?.url,
		spotify_url: spotifyAlbum.external_urls.spotify
	}
}
