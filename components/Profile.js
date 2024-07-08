import { Box } from '@chakra-ui/react'
import { Flex, Heading } from '@chakra-ui/layout'
import Meta from 'components/Meta'
import { EmptyFollowings, FollowedArtistsGrid } from './Followings'

const Profile = ({ followings }) => {
	return (
		<Box minHeight="100vh">
			<Meta title="Profile" />
			<Heading as="h3" fontSize={['2xl', '3xl']} my={10} textAlign="left">
				Followed Artists
			</Heading>
			<Flex flexDir="column" align="top" justify="top" width="80vw">
				{followings.length ? (
					<FollowedArtistsGrid followings={followings} onUnfollow={() => {}} />
				) : (
					<EmptyFollowings />
				)}
			</Flex>
		</Box>
	)
}

export default Profile
