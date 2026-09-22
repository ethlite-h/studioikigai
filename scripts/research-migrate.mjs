// Applies db/migrations/*.sql in order, once each. Usage: DATABASE_URL=... node scripts/research-migrate.mjs
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set"); process.exit(1); }
const client = new pg.Client({ connectionString: url, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: true } });
await client.connect();
await client.query("create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())");
const dir = path.resolve("db/migrations");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const done = new Set((await client.query("select name from schema_migrations")).rows.map((r) => r.name));
for (const f of files) {
  if (done.has(f)) continue;
  const sql = fs.readFileSync(path.join(dir, f), "utf8");
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query("insert into schema_migrations (name) values ($1)", [f]);
    await client.query("commit");
    console.log("applied", f);
  } catch (e) {
    await client.query("rollback");
    console.error("failed", f, e.message);
    process.exit(1);
  }
}
await client.end();
console.log("migrations up to date");
