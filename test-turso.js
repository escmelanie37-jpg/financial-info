const { createClient } = require("@libsql/client");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function test() {
  const result = await client.execute("SELECT * FROM users LIMIT 5");
  console.log("Usuarios:", result.rows);
}

test();
