import { Box } from '@chakra-ui/react'
import { Menu, X } from 'react-feather'

const MenuToggle = ({ toggle, isOpen }) => {
	return (
		<Box display={{ base: 'block', md: 'none' }} onClick={toggle}>
			{isOpen ? <X /> : <Menu />}
		</Box>
	)
}

export default MenuToggle
