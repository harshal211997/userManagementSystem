const { User } = require("../model/userModel.js");
const { UserRole } = require("../model/userRoleModel.js");
const { Op } = require("sequelize");
//Assign user Role:
exports.assignUserRole = async (req, res, next) => {
  const { userId } = req.params;
  const { role_id } = req.body;
  try {
    if (!role_id) {
      return res.status(400).json({
        status: "Fail",
        message: "Please provide Role ID",
      });
    }
    const user = await User.findOne({
      where: { userId },
    });

    if (!user) {
      return res.status(404).json({
        status: "Fail",
        message: "User not found",
      });
    }
    const role = await UserRole.findOne({
      where: { id: role_id },
    });
    if (!role) {
      return res.status(404).json({
        status: "Fail",
        message: "Role not found",
      });
    }
    await User.update(
      {
        role_id,
      },
      {
        where: { userId },
      }
    );
    res.status(200).json({
      status: "Success",
      message: "Role Assigned Successfully!",
    });
  } catch (error) {
    res.status(500).json({
      status: "Fail",
      message: "Internal Server Error",
    });
  }
};

//Get User By Id:
exports.getUserById = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const userExists = await User.findOne({
      where: { userId },
    });
    if (!userExists) {
      return res.status(404).json({
        status: "Fail",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "Success",
      data: {
        id: userExists.dataValues.userId,
        first_name: userExists.dataValues.first_name,
        last_name: userExists.dataValues.last_name,
        email: userExists.dataValues.email,
        phone: userExists.dataValues.phone_number,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Fail",
      message: "Internal Server Error",
    });
  }
};

//Update User:
exports.updateUser = async (req, res, next) => {
  const { userId } = req.params;
  const { fisrt_name, last_name, email, phone_number } = req.body;
  try {
    const userExists = await User.findOne({
      where: { userId },
    });

    if (!userExists) {
      return res.status(404).json({
        status: "Fail",
        message: "User not found, Please check user ID",
      });
    }
    await User.update(
      {
        fisrt_name,
        last_name,
        email,
        phone_number,
      },
      {
        where: { userId },
      }
    );

    res.status(200).json({
      status: "Success",
      message: "User detail updated successfully!",
    });
  } catch (error) {
    res.status(500).json({
      status: "Fail",
      message: "Internal Server Error",
    });
  }
};

//Delete User:
exports.deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const userExists = await User.findOne({
      where: { userId },
    });
    if (!userExists) {
      return res.status(404).json({
        status: "Fail",
        message: "User not found, Please check user ID",
      });
    }
    await User.destroy({
      where: { userId },
    });
    res.status(200).json({
      status: "Success",
      message: "User Deleted Successfully!",
    });
  } catch (error) {
    res.status(500).json({
      status: "Fail",
      message: "Internal Server Error",
    });
  }
};

//list users:
exports.listUsers = async (req, res, next) => {
  let { first_name, last_name, email, phone_number, role_name, page, limit } =
    req.query;
  try {
    const filters = {
      first_name,
      last_name,
      email,
      phone_number,
    };
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    let offset = (page - 1) * limit;

    //Defining where conditions dynamically
    function buildWhereConditions(filters) {
      let whereConditons = {};
      const filterFields = {
        first_name: filters.first_name,
        last_name: filters.last_name,
        email: filters.email,
        phone_number: filters.phone_number,
      };
      Object.keys(filterFields).forEach((key) => {
        if (filterFields[key]) {
          whereConditons[key] = {
            [Op.iLike]: `%${filterFields[key]}%`,
          };
        }
      });
      return whereConditons;
    }
    const whereConditions = buildWhereConditions(filters);
    //Handling role filter:
    const roleWhere = {};
    if (role_name) {
      roleWhere.role_name = { [Op.iLike]: `%${role_name}%` };
    }
    const users = await User.findAll({
      attributes: [
        "first_name",
        "last_name",
        "email",
        ["phone_number", "phone"],
      ],
      where: whereConditions,
      include: [
        {
          model: UserRole,
          as: "role",
          attributes: [["role_name", "role"]],
          where:
            roleWhere && Object.keys(roleWhere).length ? roleWhere : undefined,
          required: false,
        },
      ],
      order: [["userId", "DESC"]],
      limit: limit,
      offset: offset,
    });
    res.status(200).json({
      status: "Success",
      total: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "Fail",
      message: error.message,
    });
  }
};
