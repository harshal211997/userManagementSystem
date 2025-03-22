const dbPool = require("../dbConnection.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userSchemaValidator = require("../validator/userValidator.js");

const singnToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Register User:
exports.register = async (req, res, next) => {
  const { first_name, last_name, password, email, phone_number } = req.body;
  try {
    //Validating user data:
    await userSchemaValidator.validateAsync(req.body);
    const userExists = await dbPool.query(
      "Select * from users where email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(409).json({
        status: "Fail",
        message: "User Alreday exists",
      });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const result = await dbPool.query(
      "insert into users (first_name, last_name, password, email, phone_number ) values ($1, $2, $3, $4, $5) returning *",
      [first_name, last_name, hashPassword, email, phone_number]
    );
    res.status(201).json({
      status: "Success",
      data: {
        userid: result["rows"][0]["userid"],
        first_name: result["rows"][0]["first_name"],
        last_name: result["rows"][0]["last_name"],
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.details[0].message,
    });
  }
};

//login :
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        status: "Fail",
        message: "Please email & password",
      });
    }
    const userExists = await dbPool.query(
      "Select * from users where email = $1",
      [email]
    );
    if (userExists.rows.length === 0) {
      return res.status(400).json({
        status: "Fail",
        message: "Invalid Credentials",
      });
    }
    const verifyPassword = await bcrypt.compare(
      password,
      userExists.rows[0]["password"]
    );
    if (!verifyPassword) {
      return res.status(400).json({
        status: "Fail",
        message: "Invalid Credentials",
      });
    }
    //JWT Token:
    const token = singnToken(userExists["rows"][0]["userid"]);
    // const cookieOptions = {
    //   expires: new Date(
    //     Date.now() + process.env.JWT_EXPIRE_IN_COOKIE * 60 * 60 * 1000
    //   ),
    // };
    // res.cookie("jwt", token, cookieOptions);
    res.status(200).json({
      status: "Success",
      token,
      message: "Login Successfully!",
    });
  } catch (error) {
    res.status(500).json({
      status: "Fail",
      message: "Internal Server Error",
    });
  }
};

//Protect route
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({
        status: "Fail",
        message: "You are not logged in! Please login to get access",
      });
    }
    //
    jwt.verify(token, process.env.JWT_SECRET, async (error, decode) => {
      if (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(403).json({
            status: "Fail",
            message: "Token Expired, Please login again",
          });
        }
        return res.status(403).json({
          status: "Fail",
          message: "Invalid Token",
        });
      }
      const freshUser = await dbPool.query(
        "Select * from users where userid = $1",
        [decode.id]
      );
      if (freshUser.rows.length === 0) {
        return res.status(401).json({
          status: "Fail",
          message: "The user belong to this token no longer exists.",
        });
      }
      req.user = freshUser.rows[0];
      next();
    });
  } catch (error) {
    res.status(500).json({
      status: "Fail",
      message: "Internal Server Error",
    });
  }
};

//Restrict route
exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    const result = await dbPool.query(
      "Select role_name from userRole where id = $1",
      [req.user.role_id]
    );

    if (result.rows.length > 0) {
      const role_name = result.rows[0]["role_name"];
      if (!roles.includes(role_name)) {
        return res.status(403).json({
          status: "Fail",
          message: "You Do not have permission to perform this action",
        });
      }
    } else {
      return res.status(403).json({
        status: "Fail",
        message: "You Do not have permission to perform this action",
      });
    }
    next();
  };
};
