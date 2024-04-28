import NextLink from 'next/link'

const Link = ({ to, children }) => {
	return (
		<NextLink href={to} passHref>
			{children}
		</NextLink>
	)
}

export default Link
