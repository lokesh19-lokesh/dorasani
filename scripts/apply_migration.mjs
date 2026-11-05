import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Nagaraju%4099@db.irtvutkwjdjkghobnnct.supabase.co:5432/postgres';

async function applyMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();

    const sqlPath = path.resolve('supabase/migrations/20261105000001_dorasani_production_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration 20261105000001_dorasani_production_schema.sql...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('Migration applied successfully!');
  } catch (err) {
    console.error('Migration failed. Rolling back:', err);
    try {
      await client.query('ROLLBACK');
    } catch (e) {
      // ignore
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();

