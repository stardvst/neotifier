import { Button, Heading, Text, VStack } from '@chakra-ui/react'
import Image from 'components/Image'
import Link from 'components/Link'

const Album = ({
	title,
	artists,
	albumCover,
	genres,
	releasedAt,
	spotifyUrl,
	discogsUrl,
	addedAt
}) => {
	return (
		<VStack align="flex-start">
			<Image src={albumCover} alt={title} width={250} height={250} />
			<Heading as="h5" fontSize="lg">
				{title}
			</Heading>
			<Text>{artists.join(', ')}</Text>
			<Text fontSize={15}>{genres.join(', ')}</Text>
			<Text fontSize={13}>{releasedAt}</Text>
			<Text fontSize={13}>Added on {addedAt}</Text>
			{spotifyUrl && (
				<Link to={spotifyUrl} props={{ isExternal: true }}>
					<Button>Open in Spotify</Button>
				</Link>
			)}
			{!spotifyUrl && discogsUrl && (
				<Link to={discogsUrl} props={{ isExternal: true }}>
					<Button>View in Discogs</Button>
				</Link>
			)}
		</VStack>
	)
}

export default Album
