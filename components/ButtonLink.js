import { Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'

const ButtonLink = ({
	children,
	to,
	bgColor,
	bgColorHover,
	textColor = 'black',
	textColorHover = 'currentColor',
	isExternal = false,
	...props
}) => {
	const router = useRouter()

	const handleClick = () => {
		if (isExternal) {
			window.open(to, '_blank')
		} else {
			router.push(to)
		}
	}

	return (
		<Button
			borderColor="black"
			borderWidth={2}
			borderRadius={6}
			bgColor={bgColor}
			color={textColor}
			size="md"
			mx={2}
			px={10}
			height={12}
			w={['100%', '100%', 'auto']}
			boxShadow="3px 3px 0 black"
			_hover={{
				bg: bgColorHover,
				boxShadow: 'none',
				color: textColorHover
			}}
			_active={{
				bg: bgColorHover,
				boxShadow: 'none',
				color: textColorHover
			}}
			transition="background-color 400ms linear, color 200ms linear"
			onClick={handleClick}
			{...props}
		>
			{children}
		</Button>
	)
}

export default ButtonLink
