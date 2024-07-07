import { Box, Container, Flex } from '@chakra-ui/react'
import NavBar from 'components/NavBar'
import Meta from 'components/Meta'
import Footer from 'components/Footer'

const Layout = ({ children }) => {
	return (
		<Container maxW="container.8xl" padding={0}>
			<Flex direction="column" minH="100vh">
				<Meta description="Get instant notifications for new releases from your favorite artists" />
				<NavBar />
				<Box as="main" marginTop={0} flex={1} width="100%">
					{children}
				</Box>
				<Footer />
			</Flex>
		</Container>
	)
}

export default Layout
