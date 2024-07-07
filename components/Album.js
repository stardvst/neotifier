import { useState, useEffect, useRef } from 'react'
import { Container, Text, Tooltip, VStack, Box, Button } from '@chakra-ui/react'
import { DiscogsLogo, SpotifyLogo } from 'lib/icons'
import { Image } from '@chakra-ui/react'

const cardSize = 270
const iconSize = 20

const TooltipWhenTruncated = ({ label, children, ...props }) => {
	const ref = useRef()
	const [isTextTruncated, setIsTextTruncated] = useState(false)

	useEffect(() => {
		if (ref.current) {
			setIsTextTruncated(ref.current.scrollWidth > ref.current.clientWidth)
		}
	}, [])

	const tooltip = (
		<Text ref={ref} isTruncated {...props}>
			{children}
		</Text>
	)

	return isTextTruncated ? (
		<Tooltip label={label} hasArrow placement="bottom-start">
			{tooltip}
		</Tooltip>
	) : (
		tooltip
	)
}

const Album = ({ title, artists, albumCover, releasedAt, spotifyUrl, discogsUrl }) => {
	return (
		<VStack
			align="flex-start"
			borderColor="gray.300"
			borderWidth={1}
			borderRadius="md"
			boxShadow="md"
			maxWidth="270px"
			bg="white"
			overflow="hidden"
			_hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
			transition="all 0.2s ease-in-out"
		>
			<Box width="full" overflow="hidden">
				<Image src={albumCover} alt={title} width={cardSize} height={cardSize} objectFit="cover" />
			</Box>
			<Container py={4} px={4}>
				<VStack align="flex-start" spacing={2} overflow="hidden">
					<TooltipWhenTruncated label={title} maxW="240px" fontWeight="bold" fontSize="md">
						{title}
					</TooltipWhenTruncated>
					<TooltipWhenTruncated
						label={artists.join(', ')}
						maxW="240px"
						fontSize="sm"
						color="gray.600"
					>
						{artists.join(', ')}
					</TooltipWhenTruncated>
					<Text fontSize="xs" color="gray.500">
						{releasedAt}
					</Text>
				</VStack>
				<VStack spacing={4} mt={4} width="full">
					{spotifyUrl && (
						<Button
							as="a"
							href={spotifyUrl}
							target="_blank"
							rel="noopener noreferrer"
							bg="spotify"
							_hover={{ bg: 'spotifyDarker' }}
							color="white"
							leftIcon={<SpotifyLogo width={iconSize} height={iconSize} />}
							width="full"
						>
							Spotify
						</Button>
					)}
					{discogsUrl && (
						<Button
							as="a"
							href={discogsUrl}
							target="_blank"
							rel="noopener noreferrer"
							bg="discogs"
							_hover={{ bg: 'discogsDarker' }}
							color="white"
							leftIcon={<DiscogsLogo width={iconSize} height={iconSize} />}
							width="full"
						>
							Discogs
						</Button>
					)}
				</VStack>
			</Container>
		</VStack>
	)
}

export default Album
