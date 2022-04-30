import {
	selectUsers,
	updateAuthData,
	selectAllArtistSpotifyIds,
	insertArtists,
	selectArtists,
	insertOrUpdateUserFollowings
} from 'lib/db'
import { ArtistInfo } from 'lib/discogs'

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const ARTISTS_ENDPOINT = 'https://api.spotify.com/v1/artists'
const FOLLOWING_ENDPOINT = 'https://api.spotify.com/v1/me/following'

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const basicAuthEncoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
const authHeaders = {
	Authorization: `Basic ${basicAuthEncoded}`,
	'Content-Type': 'application/x-www-form-urlencoded'
}

const getBearerHeaders = accessToken => {
	return {
		Authorization: `Bearer ${accessToken}`,
		'Content-Type': 'application/json'
	}
}

export const fetchUserFollowings = async accessToken => {
	const artists = []

	try {
		let data = await fetch(`${FOLLOWING_ENDPOINT}?type=artist&limit=50`, {
			headers: getBearerHeaders(accessToken)
		}).then(response => response.json())

		artists.push(...data?.artists?.items)

		while (data?.artists?.next) {
			data = await fetch(data.artists.next, {
				headers: getBearerHeaders(accessToken)
			}).then(response => response.json())
			artists.push(...data?.artists?.items)
		}
	} catch (error) {
		console.error(error)
	}

	return artists
}

export const saveUserFollowings = async (user, tokens) => {
	try {
		const { access_token } = tokens
		const artists = await fetchUserFollowings(access_token)
		await saveFollowings(user, artists)
	} catch (error) {
		console.error(error)
	}
}

export const getAccessToken = async email => {
	const oauthData = await getOAuthData(email)
	const { access_token: accessToken, refresh_token, expires_at } = oauthData
	if (expires_at * 1000 > Date.now()) {
		return accessToken
	}

	const tokens = await getNewAccessToken(refresh_token)
	const { access_token, expires_in } = tokens
	const accountId = oauthData.id
	const refreshToken = tokens.refresh_token ?? refresh_token
	const expiresAt = parseInt(new Date(Date.now() + expires_in * 1000).getTime() / 1000)
	await updateAuthData(accountId, access_token, refreshToken, expiresAt)
	return access_token
}

export const getArtistsAllAbums = async artistId => {
	const allAlbums = []
	const accessToken = await getClientCredentialsAccessToken()
	const headers = getBearerHeaders(accessToken)

	let data = await fetch(`${ARTISTS_ENDPOINT}/${artistId}/albums?limit=50`, { headers }).then(res =>
		res.json()
	)
	allAlbums.push(...data?.items)

	while (data?.next) {
		data = await fetch(data.next, { headers }).then(res => res.json())
		allAlbums.push(...data?.items)
	}

	return allAlbums
}

const getOAuthData = async email => {
	const usersData = await selectUsers(email)
	return usersData?.[0]
}

const getClientCredentialsAccessToken = () => {
	return new Promise((resolve, reject) => {
		fetch(TOKEN_ENDPOINT, {
			method: 'POST',
			headers: authHeaders,
			body: new URLSearchParams({
				grant_type: 'client_credentials'
			})
		})
			.then(res => res.json())
			.then(res => res.access_token)
			.then(resolve)
			.catch(reject)
	})
}

const getNewAccessToken = async refreshToken => {
	const response = await fetch(TOKEN_ENDPOINT, {
		method: 'POST',
		headers: authHeaders,
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		})
	})

	return response.json()
}

export const saveFollowings = async (user, followings) => {
	const artists = followings.map(artist => ({ spotifyId: artist.id, name: artist.name }))
	await insertNewArtists(artists)

	const artistsData = await getArtistsData(artists)
	await insertUserFollowings(user, artistsData)
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
			const artistInfo = new ArtistInfo(name, spotifyId)
			await artistInfo.init()
			const discogsReleaseCount = artistInfo.getReleaseCount()

			const artistSpotifyInfo = new SpotifyArtistInfo(name, spotifyId)
			await artistSpotifyInfo.init()
			const spotifyReleaseCount = artistSpotifyInfo.getReleaseCount()

			const discogsId = artistInfo.getArtistId()
			artistsData.push({ name, spotifyId, discogsId, discogsReleaseCount, spotifyReleaseCount })
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

export class SpotifyArtistInfo {
	constructor(artistName, spotifyId) {
		this.artistName = artistName
		this.spotifyId = spotifyId
	}

	init = async () => {
		const releasesFirstBatch = await this.#getInitialReleaseInfo()
		this.pagination = releasesFirstBatch.pagination
		this.releases = releasesFirstBatch.releases
		this.totalCount = releasesFirstBatch.totalCount
	}

	getReleaseCount = () => {
		return this.totalCount
	}

	#getInitialReleaseInfo = async () => {
		console.log('getting artist spotify release info:', this.artistName)
		const accessToken = await getClientCredentialsAccessToken()
		const headers = getBearerHeaders(accessToken)
		let data = await fetch(`${ARTISTS_ENDPOINT}/${this.spotifyId}/albums?limit=50`, {
			headers
		}).then(res => res.json())
		return { releases: data.items, pagination: data.next, totalCount: data.total }
	}
}
