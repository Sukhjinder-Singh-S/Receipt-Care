require("dotenv").config();
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { default: mongoose } = require("mongoose");
const { validationResult } = require("express-validator");

//USER SIGNUP CONTROLLER
exports.userSignup = async (req, res, next) => {
  try {
    console.log(req.body);
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(422).json(error.array());
    }
    const { name, email, password, deviceType } = req.body;
    const check = await User.findOne({ email: email });
    if (check) {
      const err = new Error(
        "User already exist,Try to login or forgot Password"
      );
      err.statusCode = 409;
      throw err;
    }
    let dType;
    deviceType == 0 ? (dType = "ios") : (dType = "android");
    const hashPass = await bcrypt.hash(password, 12);
    const saveIntoDb = await User.create({
      name: name,
      email: email,
      password: hashPass,
      deviceType: dType,
      premium: false,
      loginDate: new Date(),
    });
    const token = jwt.sign(
      {
        user: saveIntoDb._id.toString(),
        name: name,
        premium: saveIntoDb.premium,
        email: email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );
    console.log(token, saveIntoDb);
    res.status(201).json({
      message: `User is create with id ${saveIntoDb._id.toString()}`,
      token: token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//USER LOGIN CONTROLLER
exports.userLogin = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(422).json(error.array());
    }
    const { email, password, deviceType } = req.body;
    const check = await User.findOne({ email: email });
    if (!check) {
      const err = new Error("No user found,Try to signup");
      err.statusCode = 404;
      throw err;
    }
    if (check.activeStatus == false) {
      const err = new Error("You need access from admin to login");
      err.statusCode = 401;
      throw err;
    }
    const compare = await bcrypt.compare(password, check.password);
    if (!compare) {
      const err = new Error("Password did not match,Try again");
      err.statusCode = 401;
      throw err;
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
      deviceType: deviceType,
      loginDate: new Date(),
    });
    res.status(201).json({
      message: `User login into account`,
      token: token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//UPDATE USER INFORMATION
exports.updateUser = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(422).json(error.array());
    }
    const id = req.params._id;
    const check = await User.findById(id);
    if (!check) {
      const err = new Error(`No user found`);
      err.statusCode = 404;
      throw err;
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
    res.status(201).json({
      message: `User update successfully with id ${id}`,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//USER FORGOT PASSWORD
exports.forgotPassword = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(422).json(error.array());
    }
    const check = await User.findOne({ email: req.body.email });
    if (!check) {
      const err = new Error(`Email is not registered`);
      err.statusCode = 404;
      throw err;
    }
    const token = jwt.sign(
      {
        userId: check._id.toString(),
        premium: check.premium,
        email: check.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    const mailer = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    await mailer.sendMail({
      from: "Reciept <sukhjindersingh80810@gmail.com>",
      to: check.email,
      subject: "Hello",
      html: `
        <h3>Click the link below to reset you're password</h3>
        <p><a href="${req.protocol}://${req.headers.host}/user/resetLink/${token}">Reset Password</a></p>
        `,
    });
    res.status(201).json({
      message: `Message send successfully,Check you're mail please`,
      token: token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//SEND LINK GET CONTROLLER
exports.createLink = async (req, res, next) => {
  try {
    const verifyToken = jwt.verify(req.params.token, process.env.SECRET_KEY);
    if (!verifyToken) {
      const err = new Error("Jwt verification failed");
      err.statusCode = 401;
      throw err;
    }
    return res.render("../views/emailRender", { email: verifyToken.email });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//RESET USER PASSWORD
exports.resetPassword = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(422).json(error.array());
    }
    const verifyToken = jwt.verify(req.params.token, process.env.SECRET_KEY);
    if (req.body.newPassword !== req.body.confirmPassword) {
      const err = new Error(`Password didn't match`);
      err.statusCode = 500;
      throw err;
    }
    console.log(verifyToken);
    const id = new mongoose.Types.ObjectId(verifyToken.userId);
    const findUser = await User.findById(id);
    if (!findUser) {
      const err = new Error(`User not found`);
      err.statusCode = 404;
      throw err;
    }
    if (req.body.oldPassword) {
      const checkOldPassword = await bcrypt.compare(
        req.body.oldPassword,
        findUser.password
      );
      if (!checkOldPassword) {
        const err = new Error("Enter valid password");
        err.statusCode = 401;
        throw err;
      }
    }
    const compare = await bcrypt.compare(
      req.body.newPassword,
      findUser.password
    );
    if (compare) {
      const err = new Error("Enterr new password");
      err.statusCode = 401;
      throw err;
    }
    const hashPassword = await bcrypt.hash(req.body.newPassword, 12);
    await User.findByIdAndUpdate(id, { password: hashPassword });
    // res.redirect(`href="${req.protocol}://${req.headers.host}/user/login`);
    res.status(201).json({ message: `Password updated successfull` });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
