import { Box, Heading, Grid } from '@chakra-ui/layout'
import Meta from 'components/Meta'
import Album from './Album'

const Dashboard = ({ releases }) => {
	const releasesByAddedDate = releases.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
	return (
		<Box px={[4, 8, 16]} py={8} minHeight="100vh">
			<Meta title="Dashboard" />
			<Heading as="h3" fontSize={['2xl', '3xl']} my={10} textAlign="left">
				Releases for You
			</Heading>
			<Grid
				templateColumns={{
					base: 'repeat(1, 1fr)',
					md: 'repeat(2, 1fr)',
					lg: 'repeat(3, 1fr)',
					xl: 'repeat(4, 1fr)'
				}}
				gap={6}
				justifyItems="center"
			>
				{releasesByAddedDate.map((release, idx) => (
					<Album key={idx} {...release} />
				))}
			</Grid>
		</Box>
	)
}

export default Dashboard
