const { Sequelize } = require("sequelize");
const dotEnv = require("dotenv");

dotEnv.config({ path: "./conf.env" });

//Configure DB Configurations
const sequelize = new Sequelize(
  process.env.DB_database,
  process.env.DB_user,
  process.env.DB_password,
  {
    host: process.env.DB_host,
    dialect: "postgres",
    logging: false,
  }
);

//Test Connection:
sequelize
  .authenticate()
  .then(() => {
    console.log("DB Connection Successful!");
  })
  .catch((error) => {
    console.log("Connection Error: ", error);
  });

module.exports = sequelize;
