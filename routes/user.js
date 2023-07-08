const express = require("express");
const route = express.Router();

const isAuth = require("../middleware/isAuth");

const userController = require("../controller/user");

route.post("/signup", userController.userSignup);
route.post("/login", userController.userLogin);
route.patch("/update/:_id", isAuth, userController.updateUser);
route.post("/forgetPassword", userController.forgotPassword);
route.patch("/resetPassword", userController.resetPassword);

module.exports = route;
