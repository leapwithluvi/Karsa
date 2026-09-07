import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleLocal } from "drizzle-orm/node-postgres";
import pg from "pg";

export const getDb = (databaseUrl: string) => {
  if (databaseUrl.includes("neon.tech")) {
    const sql = neon(databaseUrl);
    return drizzleNeon(sql);
  }

  const pool = new pg.Pool({ connectionString: databaseUrl });
  return drizzleLocal(pool);
};
