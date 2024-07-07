import { useSession } from 'next-auth/react'
import { Text } from '@chakra-ui/layout'
import { Container, Code } from '@chakra-ui/react'
import Link from 'components/Link'
import Loading from 'components/Loading'
import { ListItem, ListIcon, UnorderedList, Center } from '@chakra-ui/react'
import { RightHandEmoji } from 'lib/emojis'

const RouteLink = ({ to, children }) => (
	<Link to={to}>
		<Code
			bgColor="neonGreen"
			_hover={{
				bg: 'neonGreen',
				boxShadow: 'none',
				bgColor: 'neonGreenDarker'
			}}
			_active={{
				bg: 'neonGreen',
				boxShadow: 'none',
				bgColor: 'neonGreenDarker'
			}}
		>
			<Text fontSize="5xl">{children}</Text>
		</Code>
	</Link>
)

const PageRouter = () => {
	const { status } = useSession()
	const isLoading = status === 'loading'

	if (isLoading) {
		return <Loading />
	}

	return (
		<Container maxW="container.xl" p={0} fontWeight="bold" fontSize="5xl">
			<Center>
				<UnorderedList spacing={5} styleType="none">
					<ListItem>
						<ListIcon as={RightHandEmoji} aria-label="Right hand pointing emoji" /> go to your{' '}
						<RouteLink to="/dashboard">/dashboard</RouteLink> to view new releases.
					</ListItem>
					<ListItem>
						<ListIcon as={RightHandEmoji} aria-label="Right hand pointing emoji" /> go to your{' '}
						<RouteLink to="/profile">/profile</RouteLink> to view or change artists
					</ListItem>
				</UnorderedList>
			</Center>
		</Container>
	)
}

export default PageRouter
