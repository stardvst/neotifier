import { getSession } from 'next-auth/react'
import Dashboard from 'components/Dashboard'
import { selectUserReleases } from 'lib/db'
import { dateFormatted } from 'lib/util'

export default function dashboard({ releases }) {
	return <Dashboard releases={releases} />
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
	const { email } = user
	const userReleases = await selectUserReleases(email)
	const releases = userReleases.map(release => ({
		...release,
		releasedAt: dateFormatted(new Date(release.releasedAt).toDateString())
	}))

	return {
		props: {
			releases
		}
	}
}
