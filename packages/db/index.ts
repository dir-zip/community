import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './drizzle/schema'
import Database from 'better-sqlite3';

const sqlite = new Database('./sqlite.db');
export * as schema from './drizzle/schema'
export const db = drizzle(sqlite, { schema });
export * from 'drizzle-orm'
