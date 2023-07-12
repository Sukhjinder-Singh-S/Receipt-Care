"use strict";

require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;
const multer = require("./helper/multer");

//ROUTE'S
const userRoute = require("./routes/user");
const receiptRoute = require("./routes/receipt");

//HELPER AND MIDDLEWARE
const dbInsert = require("./helper/default");
const Handler = require("./middleware/error-handler");
dbInsert.defaultInsert();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer);
app.use("/user", userRoute);
app.use("/receipt", receiptRoute);
app.use(Handler.errorHandler);

//MONGODB CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port);
    console.log("<<<<<<<<<< SERVER CONNECTED >>>>>>>>>>");
  })
  .catch((err) => {
    console.log(err);
  });
