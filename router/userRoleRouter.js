const express = require("express");
const useRoleController = require("../controller/userRoleController.js");
const authController = require("../controller/authController.js");
const router = express.Router();

//Routers
//
router.use(authController.protect);
router.post(
  "/createUserRole",
  authController.restrictTo("Admin"),
  useRoleController.createUserRole
);

module.exports = router;
