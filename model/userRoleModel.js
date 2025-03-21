const dbPool = require("../dbConnection.js");

//Create role table:

const createUserRoleTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS userRole (
      id SERIAL PRIMARY KEY,
      role_name VARCHAR(100) UNIQUE NOT NULL
    )
  `;
  const query1 = `
  INSERT INTO userRole (role_name) 
  SELECT 'Admin' 
  WHERE NOT EXISTS (SELECT 1 FROM userRole WHERE role_name = 'Admin');
  `;

  try {
    await dbPool.query(query);
    await dbPool.query(query1);
    console.log("userRole Table created successfully!");
  } catch (error) {
    console.log("Error while creating userRole Table: ", error.message);
  }
};

module.exports = createUserRoleTable;
