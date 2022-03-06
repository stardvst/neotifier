import { getArtistsAllAbums } from 'lib/spotify'
import { ArtistInfo, getReleaseInfo } from 'lib/discogs'
import {
	selectAllArtists,
	selectArtistFollowers,
	updateReleaseCount,
	selectUsersByIds,
	executeTransaction,
	insertArtistReleases
} from 'lib/db'
import { sendEmail } from 'lib/email'
import { dateDiffInDays } from 'lib/util'

const featRegexp = / \(feat\. .*\)/

export default async (req, res) => {
	if (req.method !== 'GET') return res.status(200).json({ message: 'OK' })

	try {
		const releaseCountUpdateRequests = []
		const artistReleases = new Map()

		const artists = await selectAllArtists()
		for (const artist of artists) {
			const { name: artistName, spotifyId: artistSpotifyId } = artist

			const artistInfo = new ArtistInfo(artistName)
			await artistInfo.init(artist.discogsId)

			const newReleaseCount = artistInfo.getReleaseCount()
			const prevReleaseCount = artist.releaseCount
			const releaseCountDiff = newReleaseCount - prevReleaseCount

			if (releaseCountDiff) {
				releaseCountUpdateRequests.push(updateReleaseCount(artistSpotifyId, newReleaseCount))
				if (releaseCountDiff < 1) continue
			}

			const latestReleases = artistInfo.getLatestReleases()
			const diffReleases = latestReleases.slice(0, releaseCountDiff)
			const newReleases = filterOldReleases(diffReleases)

			const allSpotifyAlbums = await getArtistsAllAbums(artistSpotifyId)
			const artistNewReleases = await getArtistNewReleases(newReleases, allSpotifyAlbums)

			if (artistNewReleases.length) {
				artistReleases.set(artistSpotifyId, artistNewReleases)
				await insertArtistReleases(artist.id, artistNewReleases)
			}
		}

		if (releaseCountUpdateRequests.length) {
			await executeTransaction(releaseCountUpdateRequests)
		}

		if (artistReleases.size) {
			const userReleases = await getReleasesPerUser(artistReleases)
			const users = await selectUsersByIds(...userReleases.keys())
			for (const user of users) {
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

		const albumTitle = newRelease.title.toLowerCase()
		if (spotifyAlbumTitles.has(albumTitle)) {
			const spotifyAlbumIdx = spotifyAlbumTitles.get(albumTitle)
			const spotifyAlbum = allSpotifyAlbums[spotifyAlbumIdx]

			release.title = spotifyAlbum.name
			release.artists = spotifyAlbum.artists.map(artist => artist.name)
			release.release_date = spotifyAlbum.release_date ?? 0
			release.album_cover = spotifyAlbum.images?.[0]?.url
			release.spotify_url = spotifyAlbum.external_urls.spotify
		} else {
			release.title = releaseInfo.title
			release.artists = releaseInfo.artists.map(artist => artist.name)
			release.release_date = releaseInfo.released ?? 0
			release.album_cover = releaseInfo.images?.[0]?.uri
			release.discogs_url = releaseInfo.uri
		}

		if (!release.album_cover) {
			// TODO: set default album cover or retrieve album cover
		}

		artistNewReleases.push(release)
	}
	return artistNewReleases
}

const getSpotifyAlbumTitleIndexes = spotifyAlbums => {
	return spotifyAlbums.reduce((spotifyAlbumTitles, album, idx) => {
		const albumTitle = album.name.toLowerCase().replace(featRegexp, '')
		spotifyAlbumTitles.set(albumTitle, idx)
		return spotifyAlbumTitles
	}, new Map())
}

const filterOldReleases = releases => {
	return releases.filter(release => dateDiffInDays(new Date(release.date), new Date()) <= 7)
}
