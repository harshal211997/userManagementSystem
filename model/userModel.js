const dbPool = require("../dbConnection.js");

const createUserTable = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS users (
    userId SERIAL PRIMARY KEY,
    first_name VARCHAR(1000) NOT NULL,
    last_name VARCHAR(1000) NOT NULL,
    password TEXT NOT NULL,
    email VARCHAR(1000) UNIQUE NOT NULL,
    phone_number varchar(15) UNIQUE NOT NULL,
    role_id INT REFERENCES userRole(id),
    passwordChangedAt TIMESTAMP DEFAULT NULL,
    failedAttempts INT DEFAULT 0,
    lastAttempte BIGINT DEFAULT NULL
  )
  `;
  let query1 = `
  INSERT INTO users (first_name, last_name, email, password, phone_number, role_id)
SELECT 'Harshal', 'Suryawanshi', 'harshal211997@gmail.com', 
       '$2a$12$gdoyL4E0au7DCsbZGKiKyeth02cnv59p19OPiOjsKxRA3MaCSXiLS', '7020371812',
       (SELECT id FROM userRole WHERE role_name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM users);
  `;
  try {
    await dbPool.query(query);
    await dbPool.query(query1);
    console.log("User Table Created Successfully!");
  } catch (error) {
    console.log("Error while creating User table: ", error.message);
  }
};

module.exports = createUserTable;
