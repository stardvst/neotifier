import { selectArtistInfo, selectReleasesWithoutGenre, updateReleaseGenres } from 'lib/db'
import { ArtistInfo, getReleaseInfo } from 'lib/discogs'
import { normalizeDiscogsAlbumTitle as normalizeTitle } from 'lib/util'

export default async (req, res) => {
	if (req.method !== 'POST') return res.status(200).json({ message: 'OK' })

	try {
		const artistIdToReleases = new Map()
		const albumsWithoutGenre = await selectReleasesWithoutGenre()
		console.log(`${albumsWithoutGenre.length} albums don't have a genre`)
		console.log(albumsWithoutGenre)

		for (const album of albumsWithoutGenre) {
			const { name: artistName, spotifyId } = await selectArtistInfo(album.artistId)
			console.log('----------------------------------------------------------------------------')
			console.log(artistName)
			const spotifyAlbumTitle = normalizeTitle(album)
			console.log('spotify album title:', spotifyAlbumTitle)

			if (!artistIdToReleases.has(artistName)) {
				const artistInfo = new ArtistInfo(artistName, spotifyId)
				await artistInfo.init()
				const releases = await artistInfo.getAllAlbums()
				artistIdToReleases.set(artistName, releases)
			}

			const releases = artistIdToReleases.get(artistName)
			let discogsRelease = releases.find(release => normalizeTitle(release) === spotifyAlbumTitle)
			console.log('discogsRelease 1:', discogsRelease)

			if (!discogsRelease) {
				for (const albumArtist of album.artists) {
					if (albumArtist === artistName) {
						continue
					}

					console.log('checking album artist:', albumArtist)
					if (!artistIdToReleases.has(albumArtist)) {
						const artistInfo = new ArtistInfo(albumArtist)
						await artistInfo.init()
						const releases = await artistInfo.getAllAlbums()
						artistIdToReleases.set(albumArtist, releases)
					}

					const releases = artistIdToReleases.get(albumArtist)
					discogsRelease = releases.find(release => normalizeTitle(release) === spotifyAlbumTitle)
					console.log('discogsRelease 2:', discogsRelease)

					if (discogsRelease) {
						break
					}
				}
			}

			if (discogsRelease) {
				const { genres } = await getReleaseInfo(discogsRelease.resource_url)
				await updateReleaseGenres(album.id, genres)
			}
		}

		res.status(200).json({ message: 'OK' })
	} catch (error) {
		return res.status(400).json({ message: error.message, stack: error.stack })
	}
}
