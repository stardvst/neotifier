import { deleteReleasesOlderThan } from 'lib/db'

const RELEASE_OLDNESS_DAYS = 90

export default async (req, res) => {
	if (req.method !== 'POST') return res.status(200).json({ message: 'OK' })

	try {
		await deleteReleasesOlderThan(RELEASE_OLDNESS_DAYS)
		res.status(200).json({ message: 'OK' })
	} catch (error) {
		return res.status(400).json({ message: error })
	}
}
