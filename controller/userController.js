const dbPool = require("../dbConnection.js");

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
    const user = await dbPool.query("Select * from users where userid = $1", [
      userId,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({
        status: "Fail",
        message: "User not found",
      });
    }
    const role = await dbPool.query("Select * from userRole where id = $1", [
      role_id,
    ]);
    if (role.rows.length === 0) {
      return res.status(404).json({
        status: "Fail",
        message: "Role not found",
      });
    }
    await dbPool.query("Update users set role_id = $1 where userid = $2", [
      role_id,
      userId,
    ]);
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
    const user = await dbPool.query("Select * from users where userid = $1", [
      userId,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({
        status: "Fail",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "Success",
      data: user.rows[0],
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
    const userExists = await dbPool.query(
      "Select * from users where userid = $1",
      [userId]
    );
    if (userExists.rows.length === 0) {
      return res.status(404).json({
        status: "Fail",
        message: "User not found, Please check user ID",
      });
    }
    await dbPool.query(
      "Update users set first_name = $1, last_name = $2, email = $3, phone_number = $4 where userid = $5",
      [fisrt_name, last_name, email, phone_number, userId]
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
    const userExists = await dbPool.query(
      "Select * from users where userid = $1",
      [userId]
    );
    if (userExists.rows.length === 0) {
      return res.status(404).json({
        status: "Fail",
        message: "User not found, Please check user ID",
      });
    }
    await dbPool.query("delete from users where userid = $1", [userId]);
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
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    let offset = (page - 1) * limit;
    //
    let query = `Select 
                    u.userid,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone_number,
                    r.role_name
                  from users u
                  inner join userrole r
                  on u.role_id = r.id`;
    let values = [];
    let count = 1;
    if (first_name) {
      query += ` AND u.first_name ILIKE $${count}`;
      values.push(`%${first_name}%`);
      count++;
    }
    if (last_name) {
      query += ` AND u.last_name ILIKE $${count}`;
      values.push(`%${last_name}%`);
      count++;
    }
    if (email) {
      query += ` AND u.email ILIKE $${count}`;
      values.push(`%${email}%`);
      count++;
    }
    if (phone_number) {
      query += ` AND u.phone_number ILIKE $${count}`;
      values.push(`%${phone_number}%`);
      count++;
    }
    if (role_name) {
      query += ` AND r.role_name ILIKE $${count}`;
      values.push(`%${role_name}%`);
      count++;
    }
    query += ` order by u.userid desc limit $${count} offset $${count + 1}`;
    values.push(limit, offset);
    //
    const users = await dbPool.query(query, values);
    res.status(200).json({
      status: "Success",
      total: users.rows.length,
      data: users.rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "Fail",
      message: "Internal Server Error",
    });
  }
};
