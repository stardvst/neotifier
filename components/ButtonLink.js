import { Button } from '@chakra-ui/react'
import Link from 'components/Link'

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
				bg: bgColor,
				boxShadow: 'none',
				bgColor: bgColorHover,
				color: textColorHover
			}}
			_active={{
				bg: bgColor,
				boxShadow: 'none',
				bgColor: bgColorHover,
				color: textColorHover
			}}
			transition="background-color 400ms linear, color 200ms linear"
			{...props}
		>
			<Link to={to} _hover={{ textDecoration: 'none' }} isExternal={isExternal} {...props}>
				{children}
			</Link>
		</Button>
	)
}

export default ButtonLink
