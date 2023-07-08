"use strict";

require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { default: mongoose } = require("mongoose");

//USER SIGNUP CONTROLLER
exports.userSignup = async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password, deviceType } = req.body;
    const check = await User.findOne({ email: email });
    if (check) {
      return console.log("user already exists try to login or forgot password"); //error handling
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
    res.status(500).json({
      message: `Some internal error occur please try again`,
      data: err,
    });
  }
};

//USER LOGIN CONTROLLER
exports.userLogin = async (req, res) => {
  try {
    const { email, password, deviceType } = req.body;
    const check = await User.findOne({ email: email });
    if (!check) {
      return console.log("No email found with this email,Try to signup again"); //error handling
    }
    const compare = await bcrypt.compare(password, check.password);
    if (!compare) {
      return console.log("Password did't match,Enter again"); //error handling
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
    res.status(500).json({
      message: `Some internal error occur,Please try to login again`,
      data: err,
    });
  }
};

//UPDATE USER INFORMATION
exports.updateUser = async (req, res) => {
  try {
    const id = req.params._id;
    if (!id) {
      return console.log("Please provide a id"); //error handling
    }
    const check = await User.findById(id);
    if (!check) {
      return console.log("No user found with this id"); //error handling
    }
    const payload = {
      name: req.body.name,
      email: req.body.email,
      picture: req.file,
    };
    //check user authentication here , to verify user identity
    await User.findByIdAndUpdate(id, payload);
    res.status(201).json({
      message: `User update successfully with id ${id}`,
    });
  } catch (err) {
    res.status(500).json({ message: `Some internal error occur`, data: err });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const check = await User.findOne({ email: req.body.email });
    if (!check) {
      return console.log(`Email is not registered`);
    }
    const token = jwt.sign(
      { userId: check._id.toString(), premium: check.premium },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );
    // const newPassword = Math.random().toString(36).slice(2);
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
        <h3>Click the link below</h3>
        // <p>You're new Password is <b>${newPassword}</b></p>
        ${req.protocol}://${req.headers.host}/${token}
        `,
    });
    // const hashPass = await bcrypt.hash(newPassword, 12);
    // await User.findByIdAndUpdate(check._id, { password: hashPass });
    res.status(201).json({
      message: `Message send successfully,Check you're mail please`,
      token: token,
    });
  } catch (err) {
    res.status(500).json({ message: `Some internal error occur`, data: err });
  }
};

exports.resetPassword = async (req, res) => {
  if (req.body.newPassword == req.body.confirmPassword) {
    try {
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
        return console.log(`User not found`); //error handling pending
      }
      // const checkOldPassword = await bcrypt.compare(
      //   req.body.oldPassword,
      //   findUser.password
      // );
      // if (!checkOldPassword) {
      //   return console.log(
      //     `Please enter a valid mail password, that we send you`
      //   ); //error handling pending
      // }
      const compare = await bcrypt.compare(
        req.body.newPassword,
        findUser.password
      );
      if (compare) {
        return console.log("Enter a new password"); //error handling pending
      }
      const hashPassword = await bcrypt.hash(req.body.newPassword, 12);
      await User.findByIdAndUpdate(id, { password: hashPassword });
      res.status(201).json({ message: `Password updated successfully` });
    } catch (err) {
      res.status(500).json({ messaage: `some error occur`, data: err });
    }
  } else {
    return res.status(500).json({ message: `Password didn't match` });
  }
};
