import { Button } from '@chakra-ui/button'
import { Flex } from '@chakra-ui/layout'
import { signIn } from 'next-auth/react'

const Login = () => {
	return (
		<Flex justify="center">
			<Button onClick={() => signIn('spotify')}>Login with Spotify</Button>
		</Flex>
	)
}

export default Login
