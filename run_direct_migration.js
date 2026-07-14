// Force Node to ignore self-signed cert validation issues (needed for SSL)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Direct connection string (using the IPv6 host and default port 5432)
const connectionString = "postgresql://postgres:4Hqz2i2KkAXs5FAw@db.qnnsuvitfcomulpwtpxu.supabase.co:5432/postgres?sslmode=require";
const schemaPath = path.resolve('./supabase_schema.sql');

async function runDirectMigration() {
  console.log("Reading SQL schema file...");
  let sql;
  try {
    sql = fs.readFileSync(schemaPath, 'utf8');
    console.log("Loaded schema SQL file successfully.");
  } catch (err) {
    console.error("Failed to read schema file:", err.message);
    return;
  }

  console.log("Connecting directly to your Supabase database...");
  const client = new pg.Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log("Connected successfully!");
    
    console.log("Running SQL migrations to create/update tables...");
    await client.query(sql);
    console.log("\n🎉 SUCCESS! Your Supabase database is now fully configured and updated!");
    
    // Test query to verify
    const res = await client.query("SELECT COUNT(*) FROM public.events;");
    console.log(`Verified table public.events exists. Count: ${res.rows[0].count}`);
    
    await client.end();
    console.log("Database connection closed cleanly.");
  } catch (err) {
    console.error("\n❌ Direct migration failed! Error details:");
    console.error(err.message);
    process.exit(1);
  }
}

runDirectMigration();
