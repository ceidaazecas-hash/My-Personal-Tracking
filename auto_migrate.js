// Force Node to ignore self-signed cert validation issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
import fs from 'fs';
import path from 'path';

const projectRef = "qnnsuvitfcomulpwtpxu";
const dbPass = "4Hqz2i2KkAXs5FAw";
const schemaPath = path.resolve('./supabase_schema.sql');

// List of all common Supabase AWS pooler regions
const regions = [
  "ap-southeast-1", // Singapore
  "us-east-1",      // N. Virginia
  "us-east-2",      // Ohio
  "us-west-1",      // N. California
  "us-west-2",      // Oregon
  "eu-central-1",   // Frankfurt
  "eu-west-1",      // Ireland
  "eu-west-2",      // London
  "ap-southeast-2", // Sydney
  "ap-northeast-1", // Tokyo
  "ap-northeast-2", // Seoul
  "ap-south-1",      // Mumbai
  "ca-central-1",   // Canada
  "sa-east-1"       // São Paulo
];

async function tryConnect(host, user) {
  const connectionString = `postgresql://${user}:${dbPass}@${host}:6543/postgres?sslmode=require`;
  const client = new pg.Client({
    connectionString: connectionString,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    return client;
  } catch (err) {
    // console.log(`Failed ${host} with ${user}: ${err.message}`);
    return null;
  }
}

async function runAutoMigration() {
  console.log("Loading SQL schema file...");
  let sql;
  try {
    sql = fs.readFileSync(schemaPath, 'utf8');
    console.log("SQL Schema loaded successfully.");
  } catch (err) {
    console.error("Failed to read schema file:", err.message);
    return;
  }

  console.log("Searching for the active Supabase connection pooler...");
  let activeClient = null;
  let successfulHost = "";
  let successfulUser = "";

  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    // Try both username formats
    const usernames = [
      `postgres.${projectRef}`,
      `postgres`
    ];

    for (const user of usernames) {
      // console.log(`Trying ${host} with user ${user}...`);
      const client = await tryConnect(host, user);
      if (client) {
        activeClient = client;
        successfulHost = host;
        successfulUser = user;
        break;
      }
    }
    if (activeClient) break;
  }

  if (!activeClient) {
    console.error("\n❌ Could not establish connection to any Supabase pooler regions. Please check if your project reference or database password is correct.");
    process.exit(1);
  }

  console.log(`\n✅ Connected successfully to ${successfulHost} as user ${successfulUser}!`);
  
  try {
    console.log("Executing SQL migrations on your remote database...");
    await activeClient.query(sql);
    console.log("🎉 Database migrations completed successfully!");
    
    // Validate table existence
    const res = await activeClient.query("SELECT COUNT(*) FROM public.events;");
    console.log(`Verified public.events table status: ${res.rows[0].count} events found.`);
    
    await activeClient.end();
    console.log("Database connection closed cleanly.");
  } catch (err) {
    console.error("❌ SQL Execution failed during migration:");
    console.error(err.message);
    process.exit(1);
  }
}

runAutoMigration();
