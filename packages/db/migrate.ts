import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { client, db } from '.'

const migrateDatabase = async () => {
    await migrate(db, { migrationsFolder: "./drizzle" });
    await client.end();
}

migrateDatabase()
