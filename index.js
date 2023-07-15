require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;
const cors = require("cors");
const morgan = require("morgan");

app.set("view engine", "ejs");
app.set("views", "views");

//ROUTE'S
const userRoute = require("./routes/user");
const receiptRoute = require("./routes/receipt");
const cardFolder = require("./routes/card&folder");

//HELPER AND MIDDLEWARE
const dbInsert = require("./helper/default");
const Handler = require("./middleware/error-handler");
const multer = require("./helper/multer");
// dbInsert.defaultInsert();

//CRON JOB LINK
const cronJob = require("./helper/cronScheduler").userTrack;

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer);
app.use("/user", userRoute);
app.use("/receipt", receiptRoute);
app.use("/cardFolder", cardFolder);
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
