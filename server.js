async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      icon TEXT DEFAULT '🎮',
      image_data BYTEA,
      image_type TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}