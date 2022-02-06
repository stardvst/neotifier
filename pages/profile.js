import { getSession } from 'next-auth/react'
import Profile from 'components/Profile'
import { selectUserFollowingSpotifyIds } from 'lib/db'
import { getArtistsInfo } from 'lib/spotify'

export default function profile({ serverSession, followings }) {
	return <Profile user={serverSession.user} followings={followings} />
}

export const getServerSideProps = async ({ req }) => {
	const serverSession = await getSession({ req })

	if (!serverSession) {
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		}
	}

	const { user } = serverSession
	const followings = await getFollowings(user)

	return {
		props: {
			serverSession,
			followings
		}
	}
}

const getFollowings = async user => {
	try {
		const { email } = user
		const artistSpotifyIds = await selectUserFollowingSpotifyIds(email)
		const artists = await getArtistsInfo(artistSpotifyIds)
		return artists.map(artist => ({
			name: artist.name,
			image: artist.images?.[artist.images.length - 1]?.url
		}))
	} catch (error) {
		console.error(error)
	}
}
