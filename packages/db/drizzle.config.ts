import { Config } from "drizzle-kit"

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "",
  },
} satisfies Config
