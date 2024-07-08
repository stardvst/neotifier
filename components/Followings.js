import { Flex, Grid, Text, VStack } from '@chakra-ui/layout'
import Image from 'components/Image'
import Link from 'components/Link'
import Meta from './Meta'
import { NotesEmoji } from 'lib/emojis'

const EmptyFollowings = () => (
	<VStack align="center">
		<Meta title="Profile" />
		<Text>You don&apos;t follow any artist right now...</Text>
		<Text>
			Find and follow your favorite artists on{' '}
			<Link to="https://open.spotify.com" props={{ color: 'spotify' }}>
				Spotify
			</Link>{' '}
			to be notified when they release new music.
		</Text>
	</VStack>
)

const FollowedArtist = ({ artist }) => (
	<Flex
		textAlign="left"
		p={4}
		borderWidth="1px"
		borderRadius="lg"
		alignItems="flex-start"
		overflow="hidden"
		bg="white"
		boxShadow="sm"
	>
		<Image
			src={artist?.image}
			alt={artist.name}
			width={48}
			height={48}
			objectFit="cover"
			borderRadius="lg"
			mr={4}
		/>
		<VStack alignItems="flex-start">
			<Text fontWeight="bold" noOfLines={1}>
				{artist.name}
			</Text>
			<Link to={`/artists/${artist?.id}/releases`}>
				<Text fontSize="xs" display="inline-flex" alignItems="center">
					<NotesEmoji />
					&nbsp;
				</Text>
				<Text
					fontSize="sm"
					_hover={{
						textDecoration: 'underline'
					}}
					display="inline-flex"
					alignItems="center"
				>
					Releases
				</Text>
			</Link>
		</VStack>
	</Flex>
)
const FollowedArtistsGrid = ({ followings, onUnfollow }) => (
	<Grid
		templateColumns={{
			base: 'repeat(1, 1fr)',
			md: 'repeat(2, 1fr)',
			lg: 'repeat(2, 1fr)',
			xl: 'repeat(3, 1fr)'
		}}
		gap={6}
	>
		{followings.map((artist, idx) => (
			<FollowedArtist key={idx} artist={artist} onUnfollow={onUnfollow} />
		))}
	</Grid>
)

export { EmptyFollowings, FollowedArtistsGrid }
