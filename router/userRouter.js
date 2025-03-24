const express = require("express");
const userController = require("../controller/userController.js");
const authController = require("../controller/authController.js");
const router = express.Router();

//Routers
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

//protect route:
router.use(authController.protect);
//
router.post("/updatePassword", authController.updatePassword);
router.put(
  "/:userId/assignRole",
  authController.restrictTo("Admin"),
  userController.assignUserRole
);
router.get(
  "/listUsers",
  authController.restrictTo("Admin"),
  userController.listUsers
);
router.get("/:userId", userController.getUserById);
router.put(
  "/:userId/updateUser",
  authController.restrictTo("User"),
  userController.updateUser
);
router.delete(
  "/:userId/deleteUser",
  authController.restrictTo("Admin", "User"),
  userController.deleteUser
);

module.exports = router;
