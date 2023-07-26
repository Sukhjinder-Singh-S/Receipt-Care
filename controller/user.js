"use strict";

require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");
const { SENDMAIL } = require("../helper/sendMail");

//USER SIGNUP CONTROLLER
exports.userSignup = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(StatusCodes.CONFLICT).json(error.array());
    }
    const { name, email, password, deviceType } = req.body;
    const check = await User.exists({ email: email });
    if (check) {
      return res.status(StatusCodes.CONFLICT).json({
        message: `User already exist,Try to login or forgot Password`,
      });
    }
    //check device type
    const dType = deviceType == 0 ? "ios" : "android";
    const hashPass = await bcrypt.hash(password, 12);
    const saveIntoDb = await User.create({
      name: name,
      email: email,
      password: hashPass,
      deviceType: dType,
      isVerified: false,
    });
    const mailType = 2;
    SENDMAIL(saveIntoDb, mailType, req);
    console.log(saveIntoDb);
    res.status(StatusCodes.OK).json({
      message: `User is create with id ${saveIntoDb._id.toString()}`,
    });
  } catch (err) {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err });
  }
};

//SOCAIL MEDIA SIGNUP AND SIGNIN
exports.mediaSignup = async (req, res) => {
  try {
    const { email, name, socialMediaType, mediaId, profileUrl } = req.body;
    console.log(req.body);
    if (!email || !name || !mediaId || !profileUrl) {
      return res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json({ message: "Fields are missing" });
    }
    const checkUser = await User.findOne({ email: email });
    if (checkUser) {
      await User.findByIdAndUpdate(checkUser._id, { loginDate: new Date() });
      const token = jwt.sign(
        { userId: checkUser._id, name: checkUser.name, email: checkUser.email },
        process.env.SECRET_KEY,
        { expiresIn: "24h" }
      );
      console.log(token);
      res
        .status(StatusCodes.OK)
        .json({ message: "User signin successfully", Token: token });
    } else {
      const dType = socialMediaType == 0 ? "ios" : "android";
      const user = new User({
        email: email,
        deviceType: dType,
        name: name,
        loginDate: new Date(),
        isVerified: true,
        mediaId: mediaId,
        picture: profileUrl,
      });
      const newUser = await user.save();
      const token = jwt.sign(
        { userId: newUser._id, name: newUser.name, email: newUser.email },
        process.env.SECRET_KEY,
        { expiresIn: "24h" }
      );
      console.log(token);
      res
        .status(StatusCodes.OK)
        .json({ message: "User signup successfully", Token: token });
    }
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

//USER LOGIN CONTROLLER
exports.userLogin = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(StatusCodes.CONFLICT).json(error.array());
    }
    const { email, password, deviceType } = req.body;
    const dType = deviceType === 0 ? "ios" : "android";
    const check = await User.findOne({ email: email });
    // || check.isVerified == false
    if (!check) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `If you're already signup,confirm you're email` });
    }
    if (check.activeStatus == false) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: `You need access from admin to login` });
    }
    const compare = await bcrypt.compare(password, check.password);
    if (!compare) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: `Password did not match,Try again` });
    }
    const token = jwt.sign(
      {
        userId: check._id.toString(),
        name: check.name,
        email: email,
        premium: check.premium,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );
    const id = check._id;
    await User.findByIdAndUpdate(id, {
      deviceType: dType,
      loginDate: new Date(),
    });
    res.status(StatusCodes.OK).json({
      message: `User login into account`,
      token: token,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

//UPDATE USER INFORMATION
exports.updateUser = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(StatusCodes.CONFLICT).json(error.array());
    }
    const id = req.params._id;
    const check = await User.findById(id);
    if (!check) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No user found` });
    }
    const payload = {
      name: req.body.name,
      email: req.body.email,
      picture: req.body.picture,
    };
    if (req.body.name !== req.name) {
      req.name = req.body.name;
    }
    await User.findByIdAndUpdate(id, payload);
    res.status(StatusCodes.OK).json({
      message: `User update successfully with id ${id}`,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

//USER FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(StatusCodes.CONFLICT).json(error.array());
    }
    const check = await User.findOne({ email: req.body.email });
    console.log(check);
    if (!check) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Email is not registered" });
    }
    const mailType = 0;
    SENDMAIL(check, mailType, req);
    res.status(StatusCodes.OK).json({
      message: `Message send successfully,Check you're mail please`,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

//SEND LINK GET CONTROLLER
exports.createLink = async (req, res) => {
  try {
    const verifyToken = jwt.verify(req.params.token, process.env.SECRET_KEY);
    if (!verifyToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: `Jwt verification failed` });
    }
    return res.render("../views/emailRender", { email: verifyToken.email });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

//CONFIRM USER EMAIL
exports.confirmEmail = async (req, res, next) => {
  try {
    const verifyToken = jwt.verify(req.params.token, process.env.SECRET_KEY);
    if (!verifyToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: `Jwt verification failed` });
    }
    await User.findByIdAndUpdate(verifyToken.userId, { isVerified: true });
    return res.render(`../views/confirmEmail`);
  } catch (err) {
    next(err);
  }
};

//RESET USER PASSWORD
exports.resetPassword = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(StatusCodes.CONFLICT).json(error.array());
    }
    const verifyToken = jwt.verify(req.params.token, process.env.SECRET_KEY);
    const findUser = await User.findById(verifyToken.userId);
    if (!findUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `User not found` });
    }
    const compare = await bcrypt.compare(
      req.body.newPassword,
      findUser.password
    );
    if (compare || req.body.newPassword !== req.body.confirmPassword) {
      res
        .status(StatusCodes.CONFLICT)
        .json({ message: `Password didn't match` });
    }
    console.log(verifyToken);
    const hashPassword = await bcrypt.hash(req.body.newPassword, 12);
    await User.findByIdAndUpdate(verifyToken.userId, {
      password: hashPassword,
    });
    res
      .status(StatusCodes.OK)
      .json({ message: `Password updated successfull` });
  } catch (err) {
    next(err);
  }
};

//UPDATE USER PASSWORD BY OLD PASSWORD
exports.updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const searchUser = await User.findById(req.userId);
    const compare = await bcrypt.compare(oldPassword, searchUser.password);
    console.log(compare);
    if (!compare || newPassword !== confirmPassword) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: `Please check you're password enter fields` });
    }
    const compareOldNew = await bcrypt.compare(
      newPassword,
      searchUser.password
    );
    if (compareOldNew) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: `Please enter a new password` });
    }
    const hashPass = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.userId, { password: hashPass });
    res
      .status(StatusCodes.OK)
      .json({ message: `Password updated ${searchUser.name}` });
  } catch (err) {
    next(err);
  }
};

//GET USER INFO
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `User not found` });
    }
    res.status(StatusCodes.OK).json({
      name: user.name,
      profileUrl: user.picture,
      email: user.email,
      premium: user.premium,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};
