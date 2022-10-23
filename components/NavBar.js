import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import { Flex, Stack, Box, Center, Container } from '@chakra-ui/react'
import Logo from './Logo'
import { useState } from 'react'
import MenuToggle from './MenuToggle'
import { Text } from '@chakra-ui/layout'
import ButtonLink from './ButtonLink'

const NeonPinkButton = ({ children, link }) => (
	<ButtonLink to={link} bgColor="neonPink" bgColorHover="neonPinkDarker">
		{children}
	</ButtonLink>
)

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
		>
			{links}
		</Stack>
	</Box>
)

const NavBarContainer = ({ children, ...props }) => (
	<Center borderBottom="1px solid black">
		<Container maxW="container.8xl">
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
				<Logo />
			</NavBarContainer>
		)
	}

	return (
		<NavBarContainer>
			<Logo />
			<MenuToggle toggle={toggleMenu} isOpen={isMenuOpen} />

			{session && (
				<ButtonLinks
					links={
						<>
							{!isLoggedInHomePage && (
								<>
									<NeonPinkButton link={'/dashboard'}>dashboard</NeonPinkButton>
									<NeonPinkButton link={'/profile'}>profile</NeonPinkButton>
								</>
							)}
							<NeonPinkButton link={'/'}>
								<Text onClick={signOut}>logout</Text>
							</NeonPinkButton>
						</>
					}
					isOpen={isMenuOpen}
				/>
			)}

			{!session && (
				<ButtonLinks
					links={
						<>
							<NeonPinkButton link={'/how-it-works'}>how it works?</NeonPinkButton>
							<NeonPinkButton link={'/pricing'}>pricing</NeonPinkButton>
							<NeonPinkButton link={'/contact'}>contact</NeonPinkButton>
						</>
					}
					isOpen={isMenuOpen}
				/>
			)}
		</NavBarContainer>
	)
}

export default NavBar
