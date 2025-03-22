const dbPool = require("../dbConnection.js");
const userRoleValidatorSchema = require("../validator/userRoleValidator.js");
//Create Role:
exports.createUserRole = async (req, res, next) => {
  const { role_name } = req.body;
  try {
    await userRoleValidatorSchema.validateAsync(req.body);

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
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};
