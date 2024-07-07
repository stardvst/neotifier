import { Text, Link } from '@chakra-ui/react'

const Logo = ({ appName, color, href = '/' }) => (
	<Link href={href} color={color} _hover={{ textDecoration: 'none' }}>
		<Text fontSize="4xl" fontWeight="bold" fontFamily="Inter">
			{appName}
		</Text>
	</Link>
)

export default Logo
