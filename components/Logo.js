import { appName } from 'config'
import ButtonLink from './ButtonLink'

const WhiteButton = ({ children, link }) => (
	<ButtonLink to={link} bgColor="white" bgColorDarker="neonPink">
		{children}
	</ButtonLink>
)

const Logo = () => <WhiteButton link="/">{appName}</WhiteButton>

export default Logo
