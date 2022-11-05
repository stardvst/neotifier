import { Container, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'
import Image from 'components/Image'
import { DiscogsLogo, SpotifyLogo } from 'lib/icons'
import ButtonLink from './ButtonLink'
import { Image as ChakraImage } from '@chakra-ui/react'

const cardSize = 270
const iconSize = 20

const Album = ({ title, artists, albumCover, releasedAt, spotifyUrl, discogsUrl }) => {
	return (
		<VStack
			align="flex-start"
			borderColor="black"
			borderWidth={2}
			borderRadius={6}
			boxShadow="3px 3px 0 black"
			maxWidth="274px"
		>
			<Tooltip label={title} hasArrow shouldWrapChildren placement="bottom">
				{!discogsUrl && <Image src={albumCover} alt={title} width={cardSize} height={cardSize} />}
				{discogsUrl && (
					<ChakraImage src={albumCover} alt={title} width={cardSize} height={cardSize} />
				)}
			</Tooltip>
			<Container>
				<VStack align="flex-start" overflow="hidden">
					<Tooltip label={title} hasArrow placement="bottom-start">
						<Text fontWeight="bold" isTruncated maxW="240px">
							{title}
						</Text>
					</Tooltip>
					<Tooltip label={artists.join(', ')} hasArrow placement="bottom-start">
						<Text isTruncated maxW="240px">
							{artists.join(', ')}
						</Text>
					</Tooltip>
					<Text fontSize={13} color="gray.500">
						{releasedAt}
					</Text>
				</VStack>
				{spotifyUrl && (
					<ButtonLink
						my={6}
						to={spotifyUrl}
						bgColor="spotify"
						bgColorHover="spotifyDarker"
						textColorHover="white"
						isExternal={true}
					>
						<HStack>
							<SpotifyLogo width={iconSize} height={iconSize} />
							<Text>Open in Spotify</Text>
						</HStack>
					</ButtonLink>
				)}
				{!spotifyUrl && discogsUrl && (
					<ButtonLink
						my={6}
						to={discogsUrl}
						bgColor="discogs"
						bgColorHover="white"
						textColor="white"
						textColorHover="discogs"
						isExternal={true}
					>
						<HStack>
							<DiscogsLogo width={iconSize} height={iconSize} />
							<Text>Open in Discogs</Text>
						</HStack>
					</ButtonLink>
				)}
			</Container>
		</VStack>
	)
}

export default Album
