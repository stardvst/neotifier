const milisecondsPerDay = 1000 * 60 * 60 * 24

export const dateFormatted = date => new Date(date).toUTCString().slice(5, 16)

export const dateDiffInDays = (date1, date2) => {
	const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())
	const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate())
	const utcDiff = Math.floor(utc1 - utc2)
	return Math.floor(utcDiff / milisecondsPerDay)
}
