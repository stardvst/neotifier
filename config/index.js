export const appURL = 'neotifier.vercel.app'
export const appName = 'Neotifier'
export const appVersion = '0.1.0'

export const isProduction = process.env.NODE_ENV === 'production'
export const serverURL = isProduction ? `https://${appURL}` : 'http://localhost:3000'
