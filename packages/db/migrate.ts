// I'm not sure this works yet.

// https://github.com/TypeStrong/ts-node/issues/1096#issuecomment-959454477 :D
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import * as schema from "./drizzle/schema"

const migrationClient = postgres(process.env.DATABASE_URL_DRIZZLE || "", {
  max: 1,
})
const db = drizzle(migrationClient, { schema })
migrate(db, { migrationsFolder: "./drizzle" })

// import { neon } from "@neondatabase/serverless"

// const sql = neon(process.env.DATABASE_URL || "")
// export const db = drizzle(sql, { schema })

// migrate(db, { migrationsFolder: "./drizzle" })
