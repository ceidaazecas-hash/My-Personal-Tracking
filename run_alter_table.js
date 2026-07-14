import pg from 'pg';

const connectionString = "postgresql://postgres:4Hqz2i2KkAXs5FAw@db.qnnsuvitfcomulpwtpxu.supabase.co:5432/postgres?sslmode=require";

async function runAlterTable() {
  console.log("Connecting directly to your Supabase database...");
  const client = new pg.Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    console.log("Adding column 'organization' to 'events' table if it does not exist...");
    await client.query("ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organization TEXT DEFAULT '';");
    console.log("Column 'organization' added successfully!");

    console.log("Reloading schema cache to make sure Supabase client registers it immediately...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("Schema cache reload triggered successfully!");

    await client.end();
    console.log("Database connection closed cleanly.");
    console.log("\n🎉 SUCCESS! Database schema is now fully updated and synced!");
  } catch (err) {
    console.error("\n❌ Database alteration failed! Error details:");
    console.error(err.message || err);
    process.exit(1);
  }
}

runAlterTable();
