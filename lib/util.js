const featRegexp = / \(feat\. .*\)/
const withRegexp = / \(with .*\)/

export const dateFormatted = date => new Date(date).toUTCString().slice(5, 16)

export const todayDate = () => new Date().toISOString().slice(0, 10)

export const isDateCurrentYear = date => new Date(date).getFullYear() === new Date().getFullYear()

export const normalizeSpotifyAlbumTitle = album => {
	return normalizeApostrophes(
		album.name.toLowerCase().replace(featRegexp, '').replace(withRegexp, '')
	)
}

export const normalizeDiscogsAlbumTitle = album => {
	return album.title.toLowerCase()
}

export const normalizeApostrophes = str => {
	return str.replace('’', "'")
}
