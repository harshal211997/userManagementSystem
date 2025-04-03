const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../dbConnection.js");
const { UserRole } = require("./userRoleModel.js");
const bcrypt = require("bcryptjs");
//Defining User table structure:

const User = sequelize.define(
  "User",
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      unique: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "userrole",
        key: "id",
      },
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    failedAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastAttempte: {
      type: DataTypes.BIGINT,
      defaultValue: null,
    },
    passwordResetToken: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    passwordResetExpire: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);
User.belongsTo(UserRole, { foreignKey: "role_id", as: "role" });
const syncUserDatabase = async () => {
  try {
    //sync user database
    await UserRole.sync();
    await User.sync({ alter: true });
    //Ensure 'Admin' role exists:
    const [adminRole] = await UserRole.findOrCreate({
      where: { role_name: "Admin".trim() }, // Ensures consistent lookup
      defaults: { role_name: "Admin".trim() }, // Ensures clean insertion
      logging: false,
    });
    //Insert Admin user if not exists:
    const [adminUser, created] = await User.findOrCreate({
      where: { email: "harshal211997@gmail.com" },
      defaults: {
        first_name: "Harshal",
        last_name: "Suryawanshi",
        password: await bcrypt.hash("Harsh@7677", 12),
        phone_number: "7020371812",
        role_id: adminRole.id, //rolid associated with admin role
        passwordChangedAt: null,
        failedAttempts: 0,
        lastAttempte: null,
        passwordResetToken: null,
        passwordResetExpire: 0,
      },
    });
    if (created) {
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.log("Error While Creating Database: ", error);
  }
};

module.exports = { syncUserDatabase, User };
