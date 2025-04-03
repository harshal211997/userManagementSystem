const dbPool = require("../dbConnection.js");
const { User } = require("../model/userModel.js");
const { UserRole } = require("../model/userRoleModel.js");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchemaValidator = require("../validator/userValidator.js");
const sendEmail = require("../utils/email.js");

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
    const userExists = await User.findOne({
      where: { email },
    });
    if (userExists) {
      return res.status(409).json({
        status: "Fail",
        message: "User Alreday exists",
      });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      first_name,
      last_name,
      password: hashPassword,
      email,
      phone_number,
    });
    res.status(201).json({
      status: "User registred successfully",
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
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
        message: `Please provide email & password`,
      });
    }
    const userExists = await User.findOne({
      where: { email },
    });
    if (!userExists) {
      return res.status(400).json({
        status: "Fail",
        message: `The user does not exist. Please register`,
      });
    }
    const verifyPassword = await bcrypt.compare(
      password,
      userExists.dataValues.password
    );
    const maxAttempts = 3;
    const lockTime = 15 * 60 * 1000; // 15 min locking period
    let { failedAttempts: failedattempts, lastAttempte: lastattempte } =
      userExists.dataValues;
    let isLock =
      failedattempts >= maxAttempts && Date.now() - lastattempte < lockTime;
    if (isLock) {
      return res.status(400).json({
        status: "Fail",
        message:
          "Your account is locked due to multiple failed login attempts. Try again after 15 minutes.",
      });
    }
    if (!verifyPassword) {
      const newFailedAttempt = failedattempts + 1;
      await User.update(
        {
          failedAttempts: newFailedAttempt,
          lastAttempte: Date.now(),
        },
        {
          where: { email },
        }
      );
      return res.status(400).json({
        status: "Fail",
        message: `Invalid email/username or password. Attempts left: ${Math.max(
          0,
          maxAttempts - newFailedAttempt
        )}`,
      });
    }
    //Validating user login try:
    //set failedAttempts
    await User.update(
      {
        failedAttempts: 0,
        lastAttempte: 0,
      },
      {
        where: { email },
      }
    );
    //JWT Token:
    const token = singnToken(userExists.dataValues.userId);
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
      const freshUser = await User.findOne({
        where: { userId: decode.id },
      });

      if (!freshUser) {
        return res.status(401).json({
          status: "Fail",
          message: "The user belong to this token no longer exists.",
        });
      }
      const tokenIssuedAt = decode.iat;
      const passwordChangedAt = freshUser.dataValues.passwordChangedAt;
      if (passwordChangedAt) {
        const passwordChangedTimeStamp = Math.floor(
          new Date(passwordChangedAt).getTime() / 1000
        );
        if (tokenIssuedAt < passwordChangedTimeStamp) {
          return res.status(401).json({
            status: "Fail",
            message: "Password Changed. Please login again",
          });
        }
      }
      req.user = freshUser.dataValues;
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
    const role = await UserRole.findOne({
      where: { id: req.user.role_id },
      attributes: ["role_name"],
    });

    if (role) {
      const { role_name } = role.dataValues;
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
//Update user password:
exports.updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  try {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "Fail",
        message: "All Fields are required",
      });
    }
    //will get user by user data sent from protect route
    const user = await User.findOne({
      where: { userId: req.user.userId },
    });

    //Now will verify newPassword and confirmPassword:
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "Fail",
        message: "Password do not match",
      });
    }
    //Will compare userentered old password is correct
    const verifyPassword = await bcrypt.compare(oldPassword, user.password);
    if (!verifyPassword) {
      return res.status(400).json({
        status: "Fail",
        message:
          "You Entered wrong old password, please provide correct old password!",
      });
    }
    //decrypt new password:
    const hashPassword = await bcrypt.hash(confirmPassword, 12);
    const passwordChangedAt = new Date();
    //if old password is correct
    await User.update(
      {
        password: hashPassword,
        passwordChangedAt,
      },
      {
        where: { userId: req.user.userId },
      }
    );
    res.status(200).json({
      status: "Success",
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};
//Forgot password:
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    //Get user based on email:
    const userExists = await User.findOne({
      where: { email },
    });

    if (!userExists) {
      return res.status(404).json({
        status: "Fail",
        message: "User not found",
      });
    }
    const user = userExists.dataValues;
    //Will genrate random password reset token and save in DB
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    //Will give 10min of time to reset user password:
    const passwordResetTime = Date.now() + 5 * 60 * 1000;
    //Will save this in DB:
    await User.update(
      {
        passwordResetToken: hashResetToken,
        passwordResetExpire: passwordResetTime,
      },
      {
        where: { email: user.email },
      }
    );

    //Will send email to reset password:
    const protocol = req.protocol;
    const host = req.get("host");
    const passwordResetURL = `${protocol}://${host}/api/v1/users/resetPassword/${hashResetToken}`;
    const message = `Click here to forgot password :${passwordResetURL}\n If you don't want to forgot your password, please ignore this email!`;
    //send password reset email:
    await sendEmail({
      email: user.email,
      subject: "Reset Your Password - Action Required (Valid till 5 min)",
      url: passwordResetURL,
      name: user.first_name,
    });
    res.status(200).json({
      status: "Success",
      message: "Please check your email to reset password",
    });
  } catch (error) {
    //If anywhere fail will set token and time default in DB
    await User.update(
      {
        passwordResetToken: null,
        passwordResetExpire: 0,
      },
      {
        where: { email },
      }
    );
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};

//Reset Password:
exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  try {
    //Will get user from DB for valid time of 10min pass reset:
    const result = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpire: { [Op.gt]: Date.now() },
      },
    });

    if (!result) {
      return res.status(400).json({
        status: "Fail",
        message: "Invalid or expired token. Request a new reset link.",
      });
    }
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "Fail",
        message: "All Fields are required",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "Fail",
        message: "Password do not match",
      });
    }
    //decrypt new password:
    const hashPassword = await bcrypt.hash(confirmPassword, 12);
    const passwordChangedAt = new Date();
    //update password
    await User.update(
      {
        password: hashPassword,
        passwordChangedAt: passwordChangedAt,
        passwordResetToken: null,
        passwordResetExpire: 0,
      },
      {
        where: { userId: result.dataValues.userId },
      }
    );

    res.status(200).json({
      status: "Success",
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};
