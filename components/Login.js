import { Flex, Heading, Box, Text } from '@chakra-ui/layout'
import { signIn } from 'next-auth/react'
import { useMediaQuery } from '@chakra-ui/media-query'
import ButtonLink from './ButtonLink'
import { CurlyArrowIcon } from 'lib/icons'

const Login = () => {
	const [isLargerThan768] = useMediaQuery('(min-width: 768px)')

	return (
		<Flex as="main" justifyContent="center">
			<Box as="section">
				<Heading
					as="h2"
					textAlign="center"
					fontSize={{ base: '2.25rem', md: '3rem' }}
					lineHeight={{ base: '2.5rem', md: 1.4 }}
				>
					<Text>Never miss new music!</Text>
					<Text>
						We will{' '}
						<Text
							as="span"
							color="neonPinkDarker"
							textShadow="-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000"
						>
							notify
						</Text>{' '}
						you.
					</Text>
				</Heading>

				<Flex
					flexDirection="column"
					textAlign="center"
					fontWeight="bold"
					marginTop={{ base: '2rem', md: '2.3rem' }}
					marginBottom={{ base: '3rem', md: '2.7rem' }}
					marginX={{ base: '3rem', md: '0' }}
				>
					<Flex flexDirection="column" gap="1rem" position="relative">
						<Heading as="h3" fontSize="1.2rem" fontWeight="" lineHeight="2rem">
							Get notifications for new releases from your favorite artists.
						</Heading>
						<Heading as="h3" fontSize="1.2rem" fontWeight="" lineHeight="2rem">
							Simply login with your Spotify account to import your following list.
						</Heading>
					</Flex>

					<Box transform="rotate(170deg)" zIndex={100} margin={0} marginLeft="auto">
						<CurlyArrowIcon width="150" height="150" />
					</Box>

					<Flex
						flexDirection={isLargerThan768 ? 'row' : 'column'}
						alignItems="center"
						justifyContent="center"
						fontSize="1rem"
						lineHeight="1.5rem"
					>
						<ButtonLink
							as="a"
							color="white"
							padding="1.75rem 1.5rem"
							borderRadius="full"
							bgColor="spotify"
							bgColorHover="spotifyDarker"
							_focus={{ bgColor: 'spotifyExtraDarker' }}
							onClick={() => signIn('spotify')}
							to=""
						>
							Login with Spotify
						</ButtonLink>
					</Flex>
				</Flex>
			</Box>
		</Flex>
	)
}

export default Login
