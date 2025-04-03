const { UserRole } = require("../model/userRoleModel.js");
const userRoleValidatorSchema = require("../validator/userRoleValidator.js");
//Create Role:
exports.createUserRole = async (req, res, next) => {
  const { role_name } = req.body;
  try {
    await userRoleValidatorSchema.validateAsync(req.body);
    const newRole = await UserRole.create({ role_name }, { returning: true });
    res.status(201).json({
      status: "Success",
      data: newRole.dataValues,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};
