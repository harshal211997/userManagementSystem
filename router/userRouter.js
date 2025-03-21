const express = require("express");
const userController = require("../controller/userController.js");
const authController = require("../controller/authController.js");
const router = express.Router();

// Public Routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected Routes (Requires Authentication)
router.use(authController.protect);

// Admin-Only Routes
router.use(authController.restrictTo("Admin"));
router.put("/:userId/assignRole", userController.assignUserRole);
router.get("/listUsers", userController.listUsers);
router.delete("/:userId/deleteUser", userController.deleteUser);

// Admin & User Routes
router.use(authController.restrictTo("Admin", "User"));
router.get("/:userId", userController.getUserById);
router.put("/:userId/updateUser", userController.updateUser);

module.exports = router;
