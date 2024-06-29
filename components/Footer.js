import { Flex, HStack, Text } from '@chakra-ui/layout'
import { chakra } from '@chakra-ui/system'
import { Twitter } from 'react-feather'
import Link from 'components/Link'

const Footer = () => {
	return (
		<Flex h={16} justify="center" as="footer" borderTop="1px solid black" bg={'white'}>
			<HStack justify="center" align="center">
				<Text>© Neotifier</Text>
				<Text>|</Text>
				<Link to="/about">About</Link>
				<Text> • </Text>
				<Link to="/contact">Contact</Link>
				<Text> • </Text>
				<Link to="/privacy">Privacy</Link>
				<Text> • </Text>
				<Link to="https://www.twitter.com/neotifier">
					<chakra.span as={Twitter} size={16} color="black" fill="black"></chakra.span>
				</Link>
			</HStack>
		</Flex>
	)
}

export default Footer
