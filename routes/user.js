const express = require("express");
const route = express.Router();
const isAuth = require("../middleware/isAuth");

const userController = require("../controller/user");
const { VALIDATOR } = require("../middleware/expressValidation");

route.post("/signup", VALIDATOR.USER_SIGNUP, userController.userSignup);
route.post("/login", VALIDATOR.USER_LOGIN, userController.userLogin);
route.get("/getUser", isAuth, userController.getUser);
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

route.patch("/updatePass", isAuth, userController.updatePassword);

route.get("/confirmEmail/:token", userController.confirmEmail);
route.get("/resetLink/:token", userController.createLink);

//social media signin and signup
route.post("/socialMedia", userController.mediaSignup);


module.exports = route;
