import { Flex } from '@chakra-ui/layout'
import ScaleLoader from 'react-spinners/ScaleLoader'

const Loading = () => {
	return (
		<Flex justify="center">
			<ScaleLoader color={'gray'} loading={true} height={16} width={4} />
		</Flex>
	)
}

export default Loading
