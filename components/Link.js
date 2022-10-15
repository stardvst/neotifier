import { Link as ChakraLink } from '@chakra-ui/react'
import NextLink from 'next/link'

const Link = ({ to, children, ...props }) => {
	return (
		<NextLink href={to} passHref>
			<ChakraLink {...props}>{children}</ChakraLink>
		</NextLink>
	)
}

export default Link
