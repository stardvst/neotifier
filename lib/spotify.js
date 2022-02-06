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

export const saveUserFollowings = async (user, tokens) => {
	const { access_token } = tokens
	const artists = []

	let data = await fetch(`${FOLLOWING_ENDPOINT}?type=artist&limit=50`, {
		headers: getBearerHeaders(access_token)
	}).then(response => response.json())

	artists.push(...data?.artists?.items)

	while (data?.artists?.next) {
		data = await fetch(data.artists.next, {
			headers: getBearerHeaders(access_token)
		}).then(response => response.json())
		artists.push(...data?.artists?.items)
	}

	try {
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

export const getArtistsInfo = async artistIds => {
	const limit = 50
	const artists = []
	const artistsCount = artistIds.length
	const accessToken = await getClientCredentialsAccessToken()

	try {
		let startIdx = 0
		while (startIdx < artistsCount) {
			const artistIdsJoined = artistIds.slice(startIdx, startIdx + limit).join(',')
			const artistsInfo = await getArtists(artistIdsJoined, accessToken)
			artistsInfo.forEach(artist => {
				artists.push({ name: artist.name, images: artist.images })
			})
			startIdx += limit
		}
	} catch (error) {
		console.log(error)
	}

	return artists
}

export const getArtistsAllAbums = async artistId => {
	const allAlbums = []
	const accessToken = await getClientCredentialsAccessToken()

	let data = await fetch(`${ARTISTS_ENDPOINT}/${artistId}/albums?limit=50`, {
		headers: getBearerHeaders(accessToken)
	}).then(res => res.json())

	allAlbums.push(...data?.items)

	while (data?.next) {
		data = await fetch(data.next, {
			headers: getBearerHeaders(accessToken)
		}).then(res => res.json())
		allAlbums.push(...data?.items)
	}

	return allAlbums
}

const getArtists = async (artistIdsJoined, accessToken) => {
	const data = await fetch(`${ARTISTS_ENDPOINT}?ids=${artistIdsJoined}`, {
		headers: getBearerHeaders(accessToken)
	}).then(res => res.json())
	return data.artists
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

const saveFollowings = async (user, followings) => {
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
		console.log(newArtists)
		let idx = 0
		const artistsData = []
		for (const artist of newArtists) {
			const { spotifyId, name } = artist
			const artistInfo = new ArtistInfo(name)
			await artistInfo.init()
			const releaseCount = artistInfo.getReleaseCount()
			const discogsId = artistInfo.getArtistId()
			artistsData.push({ name, spotifyId, discogsId, releaseCount })
			console.log('adding new followed artist:', name)
			if (idx === 2) break
		}

		console.log(artistsData)
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
