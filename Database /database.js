const { Pool } = require("pg");

console.log(`🔄 Initializing database connection...`);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

(async () => {
  const client = await pool.connect();
  try {
    console.log(`🔄 Setting up database...`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    console.log(`✅ Database ready!`);
  } catch (err) {
    console.error(`❌ Database setup failed: ${err}`);
  } finally {
    client.release();
  }
})();

module.exports = pool;