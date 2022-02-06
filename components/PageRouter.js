import { useSession } from 'next-auth/react'
import { Text, VStack } from '@chakra-ui/layout'
import Link from 'components/Link'
import Loading from 'components/Loading'

const PageRouter = () => {
	const { status } = useSession()
	const isLoading = status === 'loading'

	if (isLoading) {
		return <Loading />
	}

	return (
		<VStack>
			<Text>
				Go to your <Link to="/dashboard">/dashboard</Link> to view new releases.
			</Text>
			<Text>
				Go to your <Link to="/profile">/profile</Link> to view or change artists
			</Text>
		</VStack>
	)
}

export default PageRouter
