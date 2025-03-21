const dbPool = require("../dbConnection.js");

//Create Role:
exports.createUserRole = async (req, res, next) => {
  const { role_name } = req.body;
  try {
    if (!role_name) {
      return res.status(400).json({
        status: "Fail",
        message: "Please provide role",
      });
    }
    if (role_name !== "Admin" && role_name !== "User") {
      return res.status(404).json({
        status: "Fail",
        message: "Invalid role, please enter valid role",
      });
    }
    const result = await dbPool.query(
      "insert into userRole (role_name) values ($1) returning *",
      [role_name]
    );
    res.status(201).json({
      status: "Success",
      data: {
        result: result["rows"][0],
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Fail",
      message: error.message,
    });
  }
};
