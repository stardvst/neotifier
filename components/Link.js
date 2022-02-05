import { Link as ChakraLink } from '@chakra-ui/layout'
import NextLink from 'next/link'

const Link = ({ to, props, children }) => {
	return (
		<NextLink href={to} passHref>
			<ChakraLink {...props}>{children}</ChakraLink>
		</NextLink>
	)
}

export default Link
