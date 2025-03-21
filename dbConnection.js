const { Pool } = require("pg");
const dotEnv = require("dotenv");

dotEnv.config({ path: "./conf.env" });

const dbPool = new Pool({
  user: process.env.DB_user,
  host: process.env.DB_host,
  database: process.env.DB_database,
  password: process.env.DB_password,
  port: process.env.DB_port,
});

async function testConnection() {
  try {
    const res = await dbPool.query("Select now()");
    console.log("DB Connection Successful!");
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
}

testConnection();

module.exports = dbPool;
