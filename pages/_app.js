import { ChakraProvider } from '@chakra-ui/react'
import { Global, css } from '@emotion/react'
import { SessionProvider } from 'next-auth/react'
import 'focus-visible/dist/focus-visible'
import theme from 'styles/theme'
import Layout from 'components/Layout'

const GlobalStyles = css`
	.js-focus-visible :focus:not([data-focus-visible-added]) {
		outline: none;
		box-shadow: none;
	}
`

export default function App({ Component, pageProps: { session, ...pageProps } }) {
	return (
		<SessionProvider session={session}>
			<ChakraProvider theme={theme}>
				<Global styles={GlobalStyles} />
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</ChakraProvider>
		</SessionProvider>
	)
}
