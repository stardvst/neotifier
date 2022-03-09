export const dateFormatted = date => new Date(date).toUTCString().slice(5, 16)

export const todayDate = () => new Date().toISOString().slice(0, 10)

export const isDateCurrentYear = date => new Date(date).getFullYear() === new Date().getFullYear()
