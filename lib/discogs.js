import { appName, appVersion } from 'lib/config'
import { getArtistsAllAbums } from 'lib/spotify'
import { normalizeDiscogsAlbumTitle, normalizeSpotifyAlbumTitle } from 'lib/util'

const RETRY_TIMEOUT = 40 * 1000

const KEY = process.env.DISCOGS_CONSUMER_KEY
const SECRET = process.env.DISCOGS_CONSUMER_SECRET
const DB_SEARCH_URL = 'https://api.discogs.com/database/search'
const ARTISTS_URL = 'https://api.discogs.com/artists'

const keySecret = `key=${KEY}&secret=${SECRET}`
const artistType = 'type=artist'
const strictMode = 'strict=true'
const releaseAttributes = `releases?sort=year&sort_order=desc`
const options = {
	headers: {
		'User-Agent': `${appName}/${appVersion}`
	}
}

export class ArtistInfo {
	constructor(artistName, spotifyId = '') {
		console.log('create artist:', artistName)
		this.artistName = encodeURIComponent(artistName)
		this.spotifyId = spotifyId
	}

	init = async (artistId = -1) => {
		if (artistId === -1) {
			this.artistId = await this.#getArtistId()
		} else {
			this.artistId = artistId
		}
		const releasesFirstBatch = await this.#getInitialReleaseInfo(this.artistId)
		this.pagination = releasesFirstBatch.pagination
		this.releases = releasesFirstBatch.releases
	}

	getArtistId = () => {
		return this.artistId ?? 0
	}

	getReleaseCount = () => {
		return this.pagination.items
	}

	getLatestReleases = () => {
		return this.releases
	}

	#getArtistId = () => {
		console.log('getting artist ID:', this.artistName)
		return new Promise((resolve, reject) => {
			this.#fetchArtistId(
				`${DB_SEARCH_URL}?q=${this.artistName}&${artistType}&${strictMode}&${keySecret}`,
				options
			)
				.then(data => resolve(data))
				.catch(reject)
		})
	}

	#getInitialReleaseInfo = artistId => {
		console.log('getting artist release info:', this.artistName)
		if (!artistId) return { releases: [], pagination: { items: 0 } }
		return new Promise((resolve, reject) => {
			fetchReleaseInfo(`${ARTISTS_URL}/${artistId}/${releaseAttributes}&${keySecret}`, options)
				.then(data => {
					return resolve({ releases: data.releases, pagination: data.pagination })
				})
				.catch(reject)
		})
	}

	#fetchArtistId = async (url, options = {}) => {
		console.log('fetching artist ID:', url)
		const res = await fetch(url, { ...options }).catch(console.error)
		const limit = parseInt(res.headers.get('X-Discogs-Ratelimit-Remaining'))
		if (limit <= 1) {
			console.log('wait to fetch artist ID:', url)
			return new Promise(resolve => setTimeout(() => resolve(), RETRY_TIMEOUT)).then(() =>
				this.#fetchArtistId(url, options)
			)
		}

		const data = await res.json()
		const artists = data.results
		if (artists.length === 1) {
			const artist = artists[0]
			return artist.id
		}

		return await this.#identifyDiscogsId(artists)
	}

	#identifyDiscogsId = async artists => {
		if (!this.spotifyId) return -1

		const spotifyReleases = await getArtistsAllAbums(this.spotifyId)
		const spotifyTitles = new Set(spotifyReleases.map(album => normalizeSpotifyAlbumTitle(album)))

		let artistId = ''
		let maxIntersection = 0
		for (const artist of artists) {
			const releasesFirstBatch = await this.#getInitialReleaseInfo(artist.id)
			const { releases: discogsReleases } = releasesFirstBatch
			const discogsTitles = new Set(discogsReleases.map(album => normalizeDiscogsAlbumTitle(album)))

			const intersection = new Set([...discogsTitles].filter(x => spotifyTitles.has(x)))
			if (intersection.size > maxIntersection) {
				maxIntersection = intersection.size
				artistId = artist.id
			}
		}
		return artistId
	}
}

const fetchReleaseInfo = async (url, options = {}) => {
	console.log('fetching release info:', url)
	const res = await fetch(url, { ...options }).catch(console.error)
	const limit = parseInt(res.headers.get('X-Discogs-Ratelimit-Remaining'))
	if (limit <= 1) {
		console.log('wait to fetch release info:', url)
		return new Promise(resolve => setTimeout(() => resolve(), RETRY_TIMEOUT)).then(() =>
			fetchReleaseInfo(url, options)
		)
	}

	const data = await res.json()
	return { releases: data.releases, pagination: data.pagination }
}

export const getReleaseInfo = async url => {
	const releaseInfo = fetch(`${url}?${keySecret}`, options).then(res => res.json())
	return releaseInfo
}
