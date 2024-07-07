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
	body: `Roboto,Parisienne,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
	heading: `Roboto,Parisienne,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`
}

const colors = {
	...chakraTheme.colors,
	neonPink: '#FF00FF',
	neonPinkDarker: '#E000E0',
	neonGreen: '#0DFF51',
	neonGreenDarker: '#12B33F',
	neonPurple: '#9D00FF',
	spotify: '#1DB954',
	spotifyDarker: '#19A054',
	spotifyExtraDarker: '#15883E',
	discogs: '#373735',
	discogsDarker: '#000000'
}

const overrides = {
	...chakraTheme,
	styles,
	fonts,
	colors
}

const customTheme = extendTheme(overrides)

export default customTheme
