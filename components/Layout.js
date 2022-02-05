import { Box } from '@chakra-ui/react'
import Nav from 'components/Nav'
import Meta from 'components/Meta'
import Footer from 'components/Footer'

const Layout = ({ children }) => {
	return (
		<>
			<Meta description="Get instant notifications for new releases from your favorite artists" />
			<Nav />
			<Box as="main">{children}</Box>
			<Footer />
		</>
	)
}

export default Layout
