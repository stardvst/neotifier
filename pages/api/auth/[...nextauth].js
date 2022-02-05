import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from 'lib/prisma'
import { saveUserFollowings } from 'lib/spotify'

const options = {
	adapter: PrismaAdapter(prisma),

	providers: [
		SpotifyProvider({
			clientId: process.env.SPOTIFY_CLIENT_ID,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
			authorization: {
				params: {
					scope: 'user-read-email user-follow-read'
				}
			},

			profile(profile, tokens) {
				const user = {
					id: profile.id,
					name: profile.display_name,
					email: profile.email,
					image: profile.images?.[0]?.url
				}

				;(async () => {
					await saveUserFollowings(user, tokens)
				})()

				return user
			}
		})
	],

	pages: {
		error: '/'
	},

	callbacks: {
		async session({ session, user }) {
			session.user.followings = user?.followings ?? []
			return session
		}
	},

	session: {
		jwt: false,
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60 // 24 hours
	},

	secret: process.env.SECRET
}

export default (req, res) => NextAuth(req, res, options)
