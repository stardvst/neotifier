import { ArtistInfo } from 'lib/discogs'
import {
	insertArtists,
	insertOrUpdateUserFollowings,
	selectAllArtistSpotifyIds,
	selectArtists
} from 'lib/db'

export default async (req, res) => {
	if (req.method !== 'POST') return res.status(200).json({ message: 'OK' })

	try {
		const { artists, user } = JSON.parse(req.body)
		await insertNewArtists(artists)

		const followings = await getArtistsData(artists)
		await insertUserFollowings(user, followings)
	} catch (error) {
		return res.status(400).json({ message: error })
	}

	res.status(200).json({ message: 'OK' })
}

const insertNewArtists = async artists => {
	const artistIds = await selectAllArtistSpotifyIds()
	const dbArtists = new Set(artistIds)
	const artistsInfo = artists.map(artist => ({
		spotifyId: artist.spotifyId,
		name: artist.name
	}))

	const newArtists = artistsInfo.filter(artistInfo => !dbArtists.has(artistInfo.spotifyId))
	if (newArtists.length) {
		const artistsData = []
		for (const artist of newArtists) {
			const { spotifyId, name } = artist
			const artistInfo = new ArtistInfo(name)
			await artistInfo.init()
			const releaseCount = artistInfo.getReleaseCount()
			const discogsId = artistInfo.getArtistId()
			artistsData.push({ name, spotifyId, discogsId, releaseCount })
			console.log('adding new followed artist:', name)
		}

		await insertArtists(artistsData)
	}
}

const getArtistsData = async artists => {
	const artistSpotifyIds = artists.map(artist => artist.spotifyId)
	return await selectArtists(artistSpotifyIds)
}

const insertUserFollowings = async (user, followings) => {
	await insertOrUpdateUserFollowings(user, followings)
}
