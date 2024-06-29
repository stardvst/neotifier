module.exports = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'i.scdn.co',
				port: '',
				pathname: '/**'
			},
			{
				protocol: 'https',
				hostname: 'i.discogs.com',
				port: '',
				pathname: '/**'
			}
		],
		formats: ['image/avif', 'image/webp']
	}
}
