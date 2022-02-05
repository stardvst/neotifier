import { useSession } from 'next-auth/react'
import PageRouter from 'components/PageRouter'
import Loading from 'components/Loading'
import Login from 'components/Login'

export default function Home() {
	const { data: session, status } = useSession()

	if (status === 'loading') {
		return <Loading />
	}

	if (status === 'unauthenticated') {
		return <Login />
	}

	if (session) {
		return <PageRouter />
	}

	return null
}
