import { Button } from '@chakra-ui/react'
import Link from 'components/Link'

const ButtonLink = ({ children, to, bgColor, bgColorDarker }) => {
	return (
		<Button
			borderColor="black"
			borderWidth={2}
			borderRadius={0}
			bgColor={bgColor}
			size="md"
			mx={2}
			px={10}
			height={12}
			w={['100%', '100%', 'auto']}
			boxShadow="3px 3px 0 black"
			_hover={{
				bg: bgColor,
				boxShadow: 'none',
				bgColor: bgColorDarker
			}}
			_active={{
				bg: bgColor,
				boxShadow: 'none',
				bgColor: bgColorDarker
			}}
		>
			<Link to={to} _hover={{ textDecoration: 'none' }}>
				{children}
			</Link>
		</Button>
	)
}

export default ButtonLink
