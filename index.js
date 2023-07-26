"use strict";

require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;
const cors = require("cors");
const morgan = require("morgan");

app.set("view engine", "ejs").set("views", "views");

//ROUTE'S
const userRoute = require("./routes/user");
const receiptRoute = require("./routes/receipt");
const cardFolder = require("./routes/card&folder");
const stripe = require("./routes/stripe");

//HELPER AND MIDDLEWARE
const dbInsert = require("./helper/default");
const Handler = require("./middleware/error-handler");
dbInsert.defaultInsert();

//CRON JOB LINK
const cronJob = require("./helper/cronScheduler").userTrack;

app
  .use(morgan("dev"))
  .use(cors())
  .use(`/stripe`, bodyParser.raw({ type: "*/*" }), stripe)
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use("/user", userRoute)
  .use("/receipt", receiptRoute)
  .use("/cardFolder", cardFolder);

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
