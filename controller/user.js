"use strict";

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { default: mongoose } = require("mongoose");

//USER SIGNUP CONTROLLER
exports.userSignup = async (req, res, next) => {
  try {
    console.log(req.body);
    const { name, email, password, deviceType } = req.body;
    const check = await User.findOne({ email: email });
    if (check) {
      const err = new Error(
        "User already exist,Try to login or forgot Password"
      );
      err.statusCode = 409;
      throw err;
    }
    const hashPass = await bcrypt.hash(password, 12);
    const saveIntoDb = await User.create({
      name: name,
      email: email,
      password: hashPass,
      deviceType: deviceType,
      premium: false,
    });
    const token = jwt.sign(
      { user: saveIntoDb._id.toString(), premium: saveIntoDb.premium },
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
    const { email, password, deviceType } = req.body;
    const check = await User.findOne({ email: email });
    if (!check) {
      const err = new Error("No user found,Try to signup");
      err.statusCode = 404;
      throw err;
    }
    const compare = await bcrypt.compare(password, check.password);
    if (!compare) {
      const err = new Error("Password did not match,Try again");
      err.statusCode = 401;
      throw err;
    }
    const token = jwt.sign(
      { userId: check._id.toString(), premium: check.premium },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );
    const id = check._id;
    await User.findByIdAndUpdate(id, {
      deviceType: deviceType,
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
    const id = req.params._id;
    if (!id) {
      const err = new Error(`Pleases provide a user ID`);
      err.statusCode = 400;
      throw err;
    }
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
    const check = await User.findOne({ email: req.body.email });
    if (!check) {
      const err = new Error(`Email is not registered`);
      err.statusCode = 404;
      throw err;
    }
    const token = jwt.sign(
      { userId: check._id.toString(), premium: check.premium },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
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
      port: 993,
    });

    await mailer.sendMail({
      from: "sukhjindersingh80810@gmail.com",
      to: check.email,
      subject: "Hello",
      html: `
        <h3>Click the link below to reset you're password</h3>
        ${req.protocol}://${req.headers.host}/${token}
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

//RESET USER PASSWORD
exports.resetPassword = async (req, res, next) => {
  try {
    if (req.body.newPassword !== req.body.confirmPassword) {
      const err = new Error(`Password didn't match`);
      err.statusCode = 500;
      throw err;
    }
    const verifyToken = jwt.verify(
      req.body.tokenLink.split(" ")[1],
      process.env.SECRET_KEY
    );
    console.log(verifyToken);
    const id = new mongoose.Types.ObjectId(verifyToken.userId);
    const findUser = await User.findById({
      _id: id,
    });
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
    res.status(201).json({ message: `Password updated successfully` });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
