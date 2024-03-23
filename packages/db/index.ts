import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from './drizzle/schema'

export const client = new Client({
    connectionString: process.env.DATABASE_URL
});

client.connect()
    .then(() => console.log("Connect to database successfully"))
    .catch((err) => console.log("Failed to establish database connection !", err));

export const db = drizzle(client, { schema });

export * as schema from './drizzle/schema'
export * from 'drizzle-orm'
