import { PrismaClient } from '@prisma/client'
import { isProduction } from 'config'

let prisma = null

if (isProduction) {
	prisma = new PrismaClient()
} else {
	if (!global.prisma) {
		global.prisma = new PrismaClient({ errorFormat: 'pretty' })
	}
	prisma = global.prisma
}

export default prisma
