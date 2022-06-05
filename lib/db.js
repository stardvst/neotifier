import prisma from 'lib/prisma'
import { milisecondsPerDay, normalizeApostrophes } from 'lib/util'

export const selectUsers = async email => {
	const data = await prisma.user.findUnique({
		where: {
			email: email
		},
		select: {
			accounts: {
				select: {
					id: true,
					refresh_token: true,
					access_token: true,
					expires_at: true
				}
			}
		}
	})
	return data.accounts
}

export const selectAllUsers = async () => {
	const data = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true
		}
	})
	return data
}

export const selectUsersByIds = userIds => {
	return prisma.user.findMany({
		where: {
			id: {
				in: userIds
			}
		}
	})
}

export const selectUserFollowingIds = async email => {
	const artists = await prisma.user.findMany({
		where: {
			email
		},
		select: {
			followings: {
				select: {
					id: true,
					spotifyId: true
				}
			}
		}
	})
	return artists[0]?.followings
}

export const selectUserReleases = async email => {
	const userFollowingIds = (await selectUserFollowingIds(email)).map(artist => artist.id)
	const userReleases = await prisma.release.findMany({
		where: {
			artistId: {
				in: userFollowingIds
			}
		}
	})
	return userReleases
}

export const selectAllArtists = () => {
	return prisma.artist.findMany()
}

export const selectAllArtistSpotifyIds = async () => {
	const data = await prisma.artist.findMany({
		select: {
			spotifyId: true
		}
	})
	return data.map(artist => artist.spotifyId)
}

export const selectArtists = artistSpotifyIds => {
	return prisma.artist.findMany({
		where: {
			spotifyId: {
				in: artistSpotifyIds
			}
		}
	})
}

export const selectArtistFollowers = async artistSpotifyId => {
	const data = await prisma.artist.findUnique({
		where: {
			spotifyId: artistSpotifyId
		},
		select: {
			followers: true
		}
	})
	return data.followers
}

export const selectArtistReleases = async artistName => {
	return prisma.release.findMany({
		where: {
			artists: {
				hasSome: artistName
			}
		}
	})
}

export const selectArtistInfo = async artistId => {
	const data = await prisma.artist.findUnique({
		where: {
			id: artistId
		},
		select: {
			name: true,
			discogsId: true,
			spotifyId: true
		}
	})
	return {
		name: data.name,
		discogsId: data.discogsId,
		spotifyId: data.spotifyId
	}
}

export const selectReleasesNotOnSpotify = () => {
	return prisma.release.findMany({
		where: {
			spotifyUrl: null
		}
	})
}

export const selectReleasesWithoutGenre = () => {
	return prisma.release.findMany({
		where: {
			genres: {
				isEmpty: true
			}
		}
	})
}

export const insertArtists = artistsData => {
	return prisma.artist.createMany({
		data: artistsData,
		skipDuplicates: true
	})
}

export const insertArtistReleases = (artistId, artistNewReleases) => {
	const releasesData = artistNewReleases.map(release => ({
		title: release.title,
		releasedAt: new Date(release.release_date),
		albumCover: release.album_cover,
		spotifyUrl: release.spotify_url,
		discogsUrl: release.discogs_url,
		genres: release.genres,
		artists: release.artists,
		artistId
	}))

	return prisma.release.createMany({
		data: releasesData,
		skipDuplicates: true
	})
}

export const updateReleaseCount = (artistSpotifyId, newReleaseCount, newSpotifyReleaseCount) => {
	return prisma.artist.update({
		where: {
			spotifyId: artistSpotifyId
		},
		data: {
			discogsReleaseCount: newReleaseCount,
			spotifyReleaseCount: newSpotifyReleaseCount
		}
	})
}

export const updateReleaseGenres = (id, genres) => {
	return prisma.release.update({
		where: {
			id
		},
		data: {
			genres
		}
	})
}

export const updateReleaseSpotifyInfo = (album, spotifyAlbum) => {
	return prisma.release.update({
		where: {
			id: album.id
		},
		data: {
			title: normalizeApostrophes(spotifyAlbum.name),
			artists: spotifyAlbum.artists.map(artist => artist.name),
			releasedAt: new Date(spotifyAlbum.release_date),
			albumCover: spotifyAlbum.images?.[0]?.url,
			spotifyUrl: spotifyAlbum.external_urls.spotify,
			discogsUrl: null // reset
		}
	})
}

export const updateAuthData = (accountId, accessToken, refreshToken, expiresAt) => {
	return prisma.account.update({
		where: {
			id: accountId
		},
		data: {
			access_token: accessToken,
			refresh_token: refreshToken,
			expires_at: expiresAt
		}
	})
}

export const insertOrUpdateUserFollowings = (user, followings) => {
	const followingsData = getFollowingsData(followings)
	return prisma.user.upsert({
		where: {
			email: user.email
		},
		create: {
			name: user.name,
			email: user.email,
			followings: {
				connectOrCreate: followingsData
			}
		},
		update: {
			followings: {
				connectOrCreate: followingsData
			}
		}
	})
}

export const deleteArtists = artistSpotifyIds => {
	return prisma.artist.deleteMany({
		where: {
			spotifyId: {
				in: artistSpotifyIds
			}
		}
	})
}

export const deleteReleasesOlderThan = days => {
	return prisma.release.deleteMany({
		where: {
			addedAt: {
				lt: new Date(Date.now() - days * milisecondsPerDay)
			}
		}
	})
}

export const executeTransaction = async queries => {
	return prisma.$transaction(queries)
}

const getFollowingsData = followings => {
	const followingsData = followings.map(following => {
		const { id, ...artist } = following
		return {
			create: artist,
			where: { id }
		}
	})
	return followingsData
}
