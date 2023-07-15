const express = require("express");
const route = express.Router();

const isAuth = require("../middleware/isAuth");

const userController = require("../controller/user");
const stripeController = require("../controller/strip");
const { VALIDATOR } = require("../helper/expressValidation");

route.get("/resetLink/:token", userController.createLink);
route.post("/signup", VALIDATOR.USER_SIGNUP, userController.userSignup);
route.post("/login", VALIDATOR.USER_LOGIN, userController.userLogin);
route.patch(
  "/update/:_id",
  VALIDATOR.USER_UPDATE,
  isAuth,
  userController.updateUser
);
route.post(
  "/forgetPassword",
  VALIDATOR.USER_FORGOTPASS,
  userController.forgotPassword
);
route.post(
  "/resetLink/:token",
  VALIDATOR.USER_RESETPASS,
  userController.resetPassword
);

//STRIPE PAYMENT ROUTES
route.post("/v1/customers", isAuth, stripeController.createCustomer);

module.exports = route;
