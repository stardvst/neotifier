import { Box } from '@chakra-ui/react'
import { Flex, Grid, Heading, HStack, Text, VStack } from '@chakra-ui/layout'
import { Avatar } from '@chakra-ui/avatar'
import Meta from 'components/Meta'
import Image from 'components/Image'
import Link from 'components/Link'

const Profile = ({ user, followings }) => {
	if (followings.length === 0) {
		return (
			<VStack>
				<Text>You don&apos;t follow any artist right now...</Text>
				<Text>
					Find and follow your favorite artists on{' '}
					<Link to="https://open.spotify.com" props={{ color: '#1DB954' }}>
						Spotify
					</Link>{' '}
					to be notified when they release new music.
				</Text>
			</VStack>
		)
	}

	return (
		<Box>
			<Meta title="Profile" />
			<Flex flexDir="column" align="center" justify="center">
				<VStack mt="20" mb="16">
					<Avatar src={user.image} name={user.name} size="2xl" />
					<Text>{user.name}</Text>
				</VStack>
				<Heading as="h3" fontSize="2xl" mb="10">
					Followed Artists
				</Heading>
				<Grid templateColumns="repeat(5, 1fr)" gap={6}>
					{followings.map((artist, idx) => (
						<HStack key={idx} maxW="320px">
							<Image src={artist?.image} alt={artist.name} width={48} height={48} rounded="full" />
							<Text isTruncated>{artist.name}</Text>
						</HStack>
					))}
				</Grid>
			</Flex>
		</Box>
	)
}

export default Profile
