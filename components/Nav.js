import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import { Flex, HStack, Spacer } from '@chakra-ui/react'
import { Button } from '@chakra-ui/button'
import Link from 'components/Link'

const Nav = () => {
	const router = useRouter()
	const isLoggedInHomePage = router.pathname === '/'

	const { data: session, status } = useSession()
	const isLoading = status === 'loading'

	if (isLoading) {
		return (
			<Flex justifyContent="flex-end">
				<Link to="/">Neotifier</Link>
				<Spacer />
			</Flex>
		)
	}

	return (
		<Flex justifyContent="flex-end">
			<Link to="/">Neotifier</Link>
			<Spacer />

			{session && (
				<HStack as="nav">
					{!isLoggedInHomePage && (
						<>
							<Link to="/dashboard">Dashboard</Link>
							<Link to="/profile">Profile</Link>
						</>
					)}
					<Button onClick={signOut} variant="unstyled">
						Log out
					</Button>
				</HStack>
			)}

			{!session && (
				<HStack as="nav">
					<Link to="/about">About</Link>
					<Link to="/contact">Contact</Link>
					<Button variant="unstyled">What&apos;s New?</Button>
				</HStack>
			)}
		</Flex>
	)
}

export default Nav
