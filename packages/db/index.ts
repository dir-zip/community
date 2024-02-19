import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./drizzle/schema"

import { Prisma, PrismaClient } from "@prisma/client"

export * as schema from "./drizzle/schema"
export * from "drizzle-orm"

const sql = neon(
  "postgresql://ignatif:oc5habz3iBSg@ep-muddy-meadow-a5z0dmsd.us-east-2.aws.neon.tech/neondb?sslmode=require"
  // process.env.DATABASE_URL || ""
)
export const db = drizzle(sql, { schema })

type UserWithInventory = Prisma.UserGetPayload<{
  include: { inventory: { include: { collection: true } } }
}>

type PostWithUserAndInventory = Prisma.PostGetPayload<{
  include: {
    user: {
      include: {
        inventory: {
          include: {
            collection: true
          }
        }
      }
    }
  }
}>

const prismaClient = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
})

type ExtendedPrismaClient = typeof prismaClient

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: ExtendedPrismaClient | undefined
}

export const prisma = prismaClient

export * from "@prisma/client"

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

const a = async () => {
  // await db.insert(schema.action).values({ title: "test", value: 1 })

  const result = await db.query.user.findMany({
    // with: {
    //   posts: true
    // },
  })
  console.log(result)

  const result1 = await db.query.action.findMany({
    // with: {
    //   posts: true
    // },
  })
  console.log(result1)
}
a()
