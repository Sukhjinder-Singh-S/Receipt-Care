"use strict";

require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;
const multer = require('./helper/multer')

const userRoute = require("./routes/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer);
app.use("/user", userRoute);
// console.log(Math.random().toString(36).slice(2))


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port);
    console.log("<<<<<<<<<< SERVER CONNECTED >>>>>>>>>>");
  })
  .catch((err) => {
    console.log(err);
  });
