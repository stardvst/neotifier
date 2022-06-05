import { selectArtistInfo, selectReleasesNotOnSpotify, updateReleaseSpotifyInfo } from 'lib/db'
import { getArtistsAllAbums } from 'lib/spotify'
import { normalizeSpotifyAlbumTitle, normalizeDiscogsAlbumTitle } from 'lib/util'

export default async (req, res) => {
	if (req.method !== 'POST') return res.status(200).json({ message: 'OK' })

	try {
		const albumsNotOnSpotify = await selectReleasesNotOnSpotify()
		console.log(`${albumsNotOnSpotify.length} albums not on spotify`)
		for (const album of albumsNotOnSpotify) {
			const { spotifyId: artistSpotifyId } = await selectArtistInfo(album.artistId)
			const allAlbums = await getArtistsAllAbums(artistSpotifyId)
			const albumTitle = normalizeDiscogsAlbumTitle(album)
			const spotifyAlbum = allAlbums.find(album => normalizeSpotifyAlbumTitle(album) === albumTitle)
			console.log(`${spotifyAlbum ? 'found' : 'not found'} spotify album for ${albumTitle}`)
			if (spotifyAlbum) {
				console.log(`updating ${albumTitle} album spotify info`)
				await updateReleaseSpotifyInfo(album, spotifyAlbum)
			}
		}

		res.status(200).json({ message: 'OK' })
	} catch (error) {
		return res.status(400).json({ message: error.message, stack: error.stack })
	}
}
