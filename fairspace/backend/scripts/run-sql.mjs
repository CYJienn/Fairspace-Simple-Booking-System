import dotenv from "dotenv"
import { readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import pg from "pg"

// Try loading common env files (.env then .env.local) so users can use either name
const envFiles = [".env", ".env.local"]
for (const f of envFiles) {
  const p = path.resolve(process.cwd(), f)
  if (existsSync(p)) {
    dotenv.config({ path: p })
  }
}

const { Client } = pg

const sqlFileArg = process.argv.find((arg) => arg.startsWith("--file="))
const sqlFile = sqlFileArg ? sqlFileArg.split("=")[1] : "sql/seed.sql"

const databaseUrl = process.env.SUPABASE_DB_URL

if (!databaseUrl) {
  console.error("Missing SUPABASE_DB_URL in environment.")
  console.error("Checked for .env and .env.local in the backend folder. Create one with SUPABASE_DB_URL set (no brackets).")
  process.exit(1)
}

const resolvedPath = path.resolve(process.cwd(), sqlFile)

async function run() {
  const sql = await readFile(resolvedPath, "utf8")
  const client = new Client({ connectionString: databaseUrl })

  await client.connect()
  try {
    await client.query(sql)
    console.log(`Executed SQL from ${sqlFile}`)
  } finally {
    await client.end()
  }
}

run().catch((error) => {
  console.error("SQL execution failed:", error)
  process.exit(1)
})
