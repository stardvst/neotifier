import { Button } from '@chakra-ui/react'

const ButtonLink = ({ children, link, onClick, bgColor, hoverColor, ...props }) => (
	<Button
		as="a"
		href={link}
		onClick={onClick}
		bg={bgColor}
		color={hoverColor}
		border="2px solid"
		borderColor={hoverColor}
		borderRadius="md"
		fontSize="md"
		minW="150px" // Minimum width for consistency
		h="48px" // Set height to 48px for larger button
		w={{ base: '100%', md: 'auto' }}
		px={6} // Increased horizontal padding
		py={2} // Reduced vertical padding to maintain height
		boxShadow="md"
		transition="background-color 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s"
		_hover={{
			bg: hoverColor,
			color: bgColor,
			transform: 'translateY(-2px)',
			boxShadow: 'lg'
		}}
		_active={{
			bg: hoverColor,
			color: bgColor,
			transform: 'translateY(0)',
			boxShadow: 'md'
		}}
		{...props}
	>
		{children}
	</Button>
)

export default ButtonLink
