import { Pool, PoolClient } from "pg";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * Migration Runner for PostgreSQL
 * Runs SQL migrations from the migrations folder
 */

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
});

const MIGRATIONS_TABLE = "migrations";

async function ensureMigrationsTable(client: PoolClient): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client.query(query);
}

async function getExecutedMigrations(client: PoolClient): Promise<string[]> {
  const result = await client.query(`SELECT name FROM ${MIGRATIONS_TABLE};`);
  return result.rows.map((row) => row.name);
}

async function recordMigration(
  client: PoolClient,
  name: string,
): Promise<void> {
  await client.query(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1);`, [
    name,
  ]);
}

async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    // Create migrations table
    await ensureMigrationsTable(client);

    // Get executed migrations
    const executed = await getExecutedMigrations(client);

    // Read migration files
    const migrationsDir = path.join(__dirname, ".");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    console.log(`Found ${files.length} migration files`);
    console.log(`Already executed: ${executed.length}`);

    for (const file of files) {
      if (!executed.includes(file)) {
        console.log(`Running migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf-8");

        await client.query(sql);
        await recordMigration(client, file);

        console.log(`✓ Completed: ${file}`);
      }
    }

    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await client.end();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
