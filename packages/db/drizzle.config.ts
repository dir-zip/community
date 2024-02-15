import { Config } from 'drizzle-kit'

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./sqlite.db"
  }
} satisfies Config;
