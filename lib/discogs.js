import { appName, appVersion } from 'config'

const RETRY_TIMEOUT = 40 * 1000

const KEY = process.env.DISCOGS_CONSUMER_KEY
const SECRET = process.env.DISCOGS_CONSUMER_SECRET
const DB_SEARCH_URL = 'https://api.discogs.com/database/search'
const ARTISTS_URL = 'https://api.discogs.com/artists'

const keySecret = `key=${KEY}&secret=${SECRET}`
const artistType = 'type=artist'
const releaseAttributes = `releases?sort=year&sort_order=desc`
const options = {
	headers: {
		'User-Agent': `${appName}/${appVersion}`
	}
}

export class ArtistInfo {
	constructor(artistName) {
		console.log('create artist:', artistName)
		this.artistName = encodeURIComponent(artistName)
	}

	init = async (artistId = -1) => {
		if (artistId === -1) {
			this.artistId = await this.#getArtistId()
		} else {
			this.artistId = artistId
		}
		const releasesFirstBatch = await this.#getInitialReleaseInfo()
		this.pagination = releasesFirstBatch.pagination
		this.releases = releasesFirstBatch.releases
	}

	getArtistId = () => {
		return this.artistId
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
			fetchArtistId(`${DB_SEARCH_URL}?q=${this.artistName}&${artistType}&${keySecret}`, options)
				.then(data => resolve(data))
				.catch(reject)
		})
	}

	#getInitialReleaseInfo = () => {
		console.log('getting artist release info:', this.artistName)
		return new Promise((resolve, reject) => {
			fetchReleaseInfo(`${ARTISTS_URL}/${this.artistId}/${releaseAttributes}&${keySecret}`, options)
				.then(data => {
					return resolve({ releases: data.releases, pagination: data.pagination })
				})
				.catch(reject)
		})
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

const fetchArtistId = async (url, options = {}) => {
	console.log('fetching artist ID:', url)
	const res = await fetch(url, { ...options }).catch(console.error)
	const limit = parseInt(res.headers.get('X-Discogs-Ratelimit-Remaining'))
	if (limit <= 1) {
		console.log('wait to fetch artist ID:', url)
		return new Promise(resolve => setTimeout(() => resolve(), RETRY_TIMEOUT)).then(() =>
			fetchArtistId(url, options)
		)
	}

	const data = await res.json()
	const artist = data.results?.[0]
	const artistId = artist?.id
	return artistId
}

export const getReleaseInfo = async url => {
	const releaseInfo = fetch(`${url}?${keySecret}`, options).then(res => res.json())
	return releaseInfo
}
