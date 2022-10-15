import { theme as chakraTheme } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'

const styles = {
	global: {
		body: {
			backgroundColor: 'white',
			color: 'black'
		}
	}
}

const fonts = {
	...chakraTheme.fonts,
	body: `"Maven Pro",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
	heading: `"Maven Pro",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`
}

const colors = {
	...chakraTheme.colors,
	neonPink: '#FF00FF',
	neonPinkDarker: '#E000E0',
	neonGreen: '#0DFF51',
	neonGreenDarker: '#12B33F'
}

const overrides = {
	...chakraTheme,
	styles,
	fonts,
	colors
}

const customTheme = extendTheme(overrides)

export default customTheme
