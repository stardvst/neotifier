import { Box, Heading, Grid } from '@chakra-ui/layout'
import Meta from 'components/Meta'
import Album from './Album'

const Dashboard = ({ releases }) => {
	const releasesByAddedDate = releases.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
	return (
		<Box>
			<Meta title="Dashboard" />
			<Heading as="h3" fontSize="2xl" mb="10">
				Releases for you
			</Heading>
			<Grid templateColumns="repeat(4, 1fr)" gap={6} justifyItems="center">
				{releasesByAddedDate.map((release, idx) => (
					<Album key={idx} {...release} />
				))}
			</Grid>
		</Box>
	)
}

export default Dashboard
