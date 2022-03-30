import { getArtistsAllAbums } from 'lib/spotify'
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

			console.log(`${++artistIdx}/${artistCount} ${artistName}`)
			const artistInfo = new ArtistInfo(artistName)
			await artistInfo.init(artist.discogsId)

			const newReleaseCount = artistInfo.getReleaseCount()
			const prevReleaseCount = artist.releaseCount
			const releaseCountDiff = newReleaseCount - prevReleaseCount

			if (releaseCountDiff < 1) {
				console.log(`${artistName} has no newly added releases`)
				continue
			}

			console.log(`update release count for ${artistName} ${prevReleaseCount}->${newReleaseCount}`)
			await updateReleaseCount(artistSpotifyId, newReleaseCount)

			const latestReleases = artistInfo.getLatestReleases()
			const diffReleases = latestReleases.slice(0, releaseCountDiff)
			const thisYearReleases = filterThisYearReleases(diffReleases)
			if (!thisYearReleases.length) {
				console.log(`${artistName} has no new releases`)
				continue
			}

			const allSpotifyAlbums = await getArtistsAllAbums(artistSpotifyId)
			const artistLatestReleases = await getArtistNewReleases(thisYearReleases, allSpotifyAlbums)
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
		const release = {}
		const releaseInfo = await getReleaseInfo(newRelease.resource_url)
		release.genres = releaseInfo.genres

		const albumTitle = normalizeDiscogsAlbumTitle(newRelease)
		if (spotifyAlbumTitles.has(albumTitle)) {
			const spotifyAlbumIdx = spotifyAlbumTitles.get(albumTitle)
			const spotifyAlbum = allSpotifyAlbums[spotifyAlbumIdx]

			release.title = normalizeApostrophes(spotifyAlbum.name)
			release.artists = spotifyAlbum.artists.map(artist => artist.name)
			release.release_date = spotifyAlbum.release_date ?? todayDate()
			release.album_cover = spotifyAlbum.images?.[0]?.url
			release.spotify_url = spotifyAlbum.external_urls.spotify
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

const filterExistingReleases = async (releases, artistName) => {
	const artistExistingReleases = await selectArtistReleases(artistName)
	const existingReleaseTitles = new Set(artistExistingReleases.map(release => release.title))
	return releases.filter(release => !existingReleaseTitles.has(release.title))
}
