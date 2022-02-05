import Head from 'next/head'

const Meta = ({ title, keywords, description }) => {
	return (
		<Head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<meta name="keywords" content={keywords} />
			<meta name="description" content={description} />
			<meta name="robots" content="follow, index" />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:site" content="@neotifier" />
			<meta name="twitter:title" content={title} />
			<meta name="twitter:description" content={description} />
			<meta property="og:type" content="website" />
			<meta property="og:site_name" content="Neotifier" />
			<meta property="og:description" content={description} />
			<meta property="og:title" content={title} />
			<link rel="icon" href="/favicon.ico" />
			<title>{title}</title>
		</Head>
	)
}

Meta.defaultProps = {
	title: 'Neotifier',
	keywords:
		'music releases, release notifications, music notifications, music release notifications',
	description: 'Get instant notifications for new releases from your favorite artists'
}

export default Meta
