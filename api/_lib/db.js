import pg from "pg";

let pool;
export function db() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    pool = new pg.Pool({
      connectionString: url,
      max: 3,
      ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: true },
    });
  }
  return pool;
}

export const RESPONSE_COLUMNS =
  "id, instrument, cohort, family_code, status, created_at, updated_at, completed_at, answers, interviewer, child_age, consent";
