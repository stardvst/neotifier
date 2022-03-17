import prisma from 'lib/prisma'

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

export const selectUsersByIds = userIds => {
	return prisma.user.findMany({
		where: {
			id: {
				in: userIds
			}
		}
	})
}

const selectUserFollowingIds = async email => {
	const artists = await prisma.user.findMany({
		where: {
			email
		},
		select: {
			followings: {
				select: {
					id: true
				}
			}
		}
	})
	return artists[0]?.followings.map(artist => artist.id)
}

export const selectUserReleases = async email => {
	const userFollowings = await selectUserFollowingIds(email)
	const userReleases = await prisma.release.findMany({
		where: {
			artistId: {
				in: userFollowings
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

export const updateReleaseCount = (artistSpotifyId, newReleaseCount) => {
	return prisma.artist.update({
		where: {
			spotifyId: artistSpotifyId
		},
		data: {
			releaseCount: newReleaseCount
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

export const executeTransaction = requests => {
	return prisma.$transaction(requests)
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
