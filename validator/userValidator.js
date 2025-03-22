const Joi = require("joi");

const userSchema = Joi.object({
  first_name: Joi.string().min(2).max(30).required().messages({
    "string.base": "First name must be a string.",
    "string.empty": "First name is required.",
    "string.min": "First name must be at least 2 characters long.",
    "string.max": "First name cannot exceed 30 characters.",
  }),

  last_name: Joi.string().min(2).max(30).required().messages({
    "string.base": "Last name must be a string.",
    "string.empty": "Last name is required.",
    "string.min": "Last name must be at least 2 characters long.",
    "string.max": "Last name cannot exceed 30 characters.",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format.",
    "string.empty": "Email is required.",
  }),

  password: Joi.string()
    .min(8)
    .max(20)
    .pattern(
      new RegExp(
        "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .messages({
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password cannot exceed 20 characters.",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }),

  phone_number: Joi.string()
    .pattern(new RegExp("^[0-9]{10}$")) // Allows only 10-digit numbers
    .required()
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits.",
      "string.empty": "Phone number is required.",
    }),
});

module.exports = userSchema;
