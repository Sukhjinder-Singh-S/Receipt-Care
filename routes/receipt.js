const express = require("express");
const route = express.Router();

const receiptController = require("../controller/receipt");
const isAuth = require("../middleware/isAuth");
const { VALIDATOR } = require("../middleware/expressValidation");

route.post(
  "/post",
  VALIDATOR.RECEIPT_POST,
  isAuth,
  receiptController.postReceipt
);
route.patch("/update/:_id", isAuth, receiptController.updateReceipt);
route.get("/getSingleRec/:_id", isAuth, receiptController.getSingleReceipts);
route.get("/bulkRec/:valid", isAuth, receiptController.getBulkRec);
route.get("/getFolderRec/:id", isAuth, receiptController.getFolderRec);
route.patch("/favourite/:_id", isAuth, receiptController.favRec);
route.get("/getFavRec", isAuth, receiptController.getFav);

module.exports = route;
