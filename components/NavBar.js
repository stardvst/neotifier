import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import { Flex, Stack, Box, Center, Container } from '@chakra-ui/react'
import Logo from './Logo'
import { useState } from 'react'
import MenuToggle from './MenuToggle'
import ButtonLink from './ButtonLink'
import { appName } from 'config'

const ButtonLinks = ({ links, isOpen }) => (
	<Box
		display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
		flexBasis={{ base: '100%', md: 'auto' }}
	>
		<Stack
			spacing={8}
			align="center"
			justify={['center', 'space-between', 'flex-end', 'flex-end']}
			direction={['column', 'column', 'row', 'row']}
			pt={[4, 4, 0, 0]}
			w="100%"
		>
			{links}
		</Stack>
	</Box>
)

const NavBarContainer = ({ children, ...props }) => (
	<Center borderBottom="1px solid #E8E8E8">
		<Container maxW="container.xl">
			<Flex
				as="nav"
				align="center"
				justify="space-between"
				wrap="wrap"
				w="100%"
				py={7}
				bg="white"
				pos="sticky"
				top={0}
				zIndex={100}
				{...props}
			>
				{children}
			</Flex>
		</Container>
	</Center>
)

const NavBar = () => {
	const router = useRouter()
	const isLoggedInHomePage = router.pathname === '/'

	const { data: session, status } = useSession()
	const isLoading = status === 'loading'

	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const toggleMenu = () => setIsMenuOpen(isOpen => !isOpen)

	if (isLoading) {
		return (
			<NavBarContainer>
				<Logo appName={appName} color="neonPink" />
			</NavBarContainer>
		)
	}

	return (
		<NavBarContainer>
			<Logo appName={appName} color="neonPink" />
			<MenuToggle toggle={toggleMenu} isOpen={isMenuOpen} />

			{session && (
				<ButtonLinks
					links={
						<>
							{!isLoggedInHomePage && (
								<>
									<ButtonLink link={'/dashboard'} bgColor="white" hoverColor="neonPink">
										dashboard
									</ButtonLink>
									<ButtonLink link={'/profile'} bgColor="white" hoverColor="neonPink">
										profile
									</ButtonLink>
								</>
							)}
							<ButtonLink link={'/'} bgColor="white" hoverColor="neonPink" onClick={signOut}>
								logout
							</ButtonLink>
						</>
					}
					isOpen={isMenuOpen}
				/>
			)}

			{!session && (
				<ButtonLinks
					links={
						<>
							<ButtonLink link={'/how-it-works'}>how it works?</ButtonLink>
							<ButtonLink link={'/pricing'}>pricing</ButtonLink>
							<ButtonLink link={'/contact'}>contact</ButtonLink>
						</>
					}
					isOpen={isMenuOpen}
				/>
			)}
		</NavBarContainer>
	)
}

export default NavBar
