import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./auth-schema";
import * as appSchema from "./app-schema";

const DB_KEY = Symbol.for("my-columns.db");

function initDb() {
  const cached = (globalThis as Record<symbol, ReturnType<typeof drizzle>>)[DB_KEY];
  if (cached) return cached;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 5_000,
  });

  const instance = drizzle(pool, {
    schema: { ...authSchema, ...appSchema },
  });

  (globalThis as Record<symbol, typeof instance>)[DB_KEY] = instance;
  return instance;
}

export const db = initDb();
