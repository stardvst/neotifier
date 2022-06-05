import { deleteArtists, selectAllUsers, selectUserFollowingIds } from 'lib/db'
import { fetchUserFollowings, getAccessToken, saveFollowings } from 'lib/spotify'

export default async (req, res) => {
	if (req.method !== 'POST') return res.status(200).json({ message: 'OK' })

	try {
		let allFollowed = new Set()
		let allUnfollowed = new Set()

		const users = await selectAllUsers()
		for (const user of users) {
			const { name, email } = user
			const prevFollowings = await selectUserFollowingIds(email)
			const prevFollowingIds = prevFollowings.map(artist => artist.spotifyId)

			const accessToken = await getAccessToken(email)
			const spotifyFollowings = await fetchUserFollowings(accessToken)

			const followed = detectNewFollowed(prevFollowingIds, spotifyFollowings)
			followed.forEach(artist => allFollowed.add(artist.id))
			console.log(
				`${name} followed ${followed.length} artists: ${followed
					.map(artist => artist.name)
					.join(', ')}`
			)

			const unfollowed = detectUnfollowed(prevFollowingIds, spotifyFollowings)
			unfollowed.forEach(artistId => allUnfollowed.add(artistId))
			console.log(`${name} unfollowed ${unfollowed.length} artists: ${unfollowed.join(', ')}`)

			if (followed.length) {
				console.log(`save new followings for ${name}`)
				await saveFollowings(user, followed)
			}
		}

		const reallyUnfollowed = [...allUnfollowed].filter(artistId => !allFollowed.has(artistId))
		if (reallyUnfollowed.length) {
			console.log(`delete ${reallyUnfollowed.length} unfollowed artists: ${reallyUnfollowed}`)
			await deleteArtists(reallyUnfollowed)
		}

		res.status(200).json({ message: 'OK' })
	} catch (error) {
		return res.status(400).json({ message: error.message, stack: error.stack })
	}
}

const detectNewFollowed = (prevFollowingIds, spotifyFollowings) => {
	const oldFollowingIds = new Set(prevFollowingIds)
	return spotifyFollowings.filter(artist => !oldFollowingIds.has(artist.id))
}

const detectUnfollowed = (prevFollowingIds, spotifyFollowings) => {
	const spotifyIds = new Set(spotifyFollowings.map(artist => artist.id))
	return prevFollowingIds.filter(artistId => !spotifyIds.has(artistId))
}
