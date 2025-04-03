const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../dbConnection.js");

//Create role table:
const UserRole = sequelize.define(
  "UserRole",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    role_name: {
      type: DataTypes.STRING(500),
      unique: true,
      allowNull: false,
      set(value) {
        this.setDataValue("role_name", value.trim());
      },
    },
  },
  {
    tableName: "userrole",
    timestamps: false,
  }
);

//Sync table and insert one record:
const syncUserRoleDatabase = async () => {
  UserRole.sync()
    .then(async () => {
      const [role, created] = await UserRole.findOrCreate({
        where: { role_name: "Admin" },
        defaults: { role_name: "Admin" },
        logging: false,
      });
      if (!created) {
        console.log("userRole Admin Already exists in DB Table");
      } else {
        console.log("userRole Admin ensured successfully");
      }
      console.log("Database & tables created!");
    })
    .catch((error) => {
      console.log("Error while syncing userRole table: ", error);
    });
};

module.exports = { syncUserRoleDatabase, UserRole };
