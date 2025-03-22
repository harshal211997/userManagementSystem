const Joi = require("joi");

const userRoleValidatorSchema = Joi.object({
  role_name: Joi.string().valid("Admin", "User").required().messages({
    "any.only": "User role must be either 'Admin' or 'User'.",
  }),
});

module.exports = userRoleValidatorSchema;
