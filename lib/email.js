import sgMail from '@sendgrid/mail'
import { renderToStaticMarkup } from 'react-dom/server'
import { appName, appURL } from 'config'
import { dateFormatted } from 'lib/util'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const signature = `-- ${appName}`

const textEmailRelease = ({ release, i }) =>
	`\t${i + 1}. "${release.title}" by ${release.artists.join(', ')} (${dateFormatted(release.date)})`

const textEmailTemplate = ({ name, releases }) =>
	`Hi ${name},

There ${releases.length === 1 ? 'is a new release' : `are the new releases`} available from ${
		releases.length === 1 ? 'an artist you follow' : 'your followed artists'
	}:

${releases.map((release, i) => textEmailRelease({ release, i })).join('\n')}

You can find more details about the releases on your dashboard: https://${appURL}/dashboard.

${signature}`

const HtmlEmailRelease = ({ release, style = {} }) => (
	<li style={{ display: 'flow-root', ...style }}>
		<a href={release.spotify_url ?? release.discogs_url}>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={release.album_cover}
				alt={release.title}
				style={{
					float: 'left',
					marginRight: '8px',
					width: '130px',
					height: '130px'
				}}
			/>
		</a>
		<div>
			<a href={release.spotify_url ?? release.discogs_url}>
				<h4 style={{ fontWeight: 'bold', margin: 0 }}>{release.title}</h4>
			</a>
			<p style={{ margin: 0 }}>by {release.artists.join(', ')}</p>
			<p style={{ fontSize: 15, margin: 0 }}>{dateFormatted(release.release_date)}</p>
		</div>
	</li>
)

const HtmlEmailTemplate = ({ name, releases }) => (
	<div>
		<p>Hi {name},</p>
		<p>
			There {releases.length === 1 ? 'is a new release' : 'are new releases'} available from{' '}
			{releases.length === 1 ? 'an artist you follow' : 'your followed artists'}:
		</p>
		<ul style={{ listStyleType: 'none' }}>
			{releases.map((release, i) => (
				<HtmlEmailRelease
					key={i}
					release={release}
					style={i === releases.length - 1 ? {} : { marginBottom: '20px' }}
				/>
			))}
		</ul>
		<p>
			You can find more details about the releases on your{' '}
			<a href={`https://${appURL}/dashboard`}>dashboard</a>.
		</p>
		<p>{signature}</p>
	</div>
)

const emailSubject = ({ releases }) =>
	`🎵 ${releases.length} ${releases.length === 1 ? 'new release' : 'new releases'} available`

const createMessage = (name, email, releases) => {
	return {
		to: `${name} <${email}>`,
		from: `${appName} <${process.env.EMAIL_FROM}>`,
		subject: emailSubject({ releases }),
		text: textEmailTemplate({ name, releases }),
		html: renderToStaticMarkup(HtmlEmailTemplate({ name, releases }))
	}
}

export const sendEmail = async (name, email, releases) => {
	try {
		console.log('Sending email to', email)
		const msg = createMessage(name, email, releases)
		await sgMail.send(msg)
		console.log('Email sent')
	} catch (error) {
		console.error('cannot send email: ', error)
	}
}
