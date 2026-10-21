export function getDatabaseUrl() {
  if (process.env.NEON_DATABASE_URL) return process.env.NEON_DATABASE_URL;

  // Replit reserves DATABASE_URL for its managed Postgres. This app uses Neon,
  // so only honor DATABASE_URL locally or on deployments outside Replit.
  if (process.env.REPL_ID) return undefined;
  return process.env.DATABASE_URL;
}
