import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool;

export function connect(): pg.Pool {
  const databaseUrl = process.env.DATABASE_URL;

  pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl?.includes("sslmode=disable")
      ? false
      : { rejectUnauthorized: false },
  });

  return pool;
}

export async function migrate(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export function getPool(): pg.Pool {
  return pool;
}
