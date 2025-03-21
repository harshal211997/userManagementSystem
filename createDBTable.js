const createUserTable = require("./model/userModel.js");
const createUserRoleTable = require("./model/userRoleModel.js");

//Create DB tables

const createDBTables = async () => {
  await createUserRoleTable();
  await createUserTable();
};

module.exports = createDBTables;
