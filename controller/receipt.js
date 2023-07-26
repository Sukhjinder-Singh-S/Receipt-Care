"use strict";

const Receipt = require("../models/receipt");
const Folder = require("../models/folder");
const { default: mongoose } = require("mongoose");
const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

//POST RECEIPT PENDING BARCODE READING
exports.postReceipt = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log(error.array());
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(error.array());
    }
    const findFolder = await Folder.findOne({ folderName: req.body.folder });
    const receipt = new Receipt({
      merchant: req.body.merchant,
      date: req.body.date,
      totalAmount: req.body.totalAmount,
      currency: req.body.currency,
      paymentMethod: req.body.paymentMethod,
      taxName1: req.body.taxName1,
      taxAmount1: req.body.taxAmount1,
      taxName2: req.body.taxName2,
      taxAmount2: req.body.taxAmount2,
      tipAmount: req.body.tipAmount,
      percentage: req.body.percentage,
      returnPolicy: req.body.returnPolicy,
      alert: req.body.alert,
      folder: findFolder._id,
      category: req.body.category,
      url: req.body.url,
      notes: req.body.notes,
      userId: req.userId,
      picture: req.file,
      barcode: req.body.barcode,
      randomNum: `#${Math.floor(Math.random() * (999 - 100 + 1) + 100)}`,
    });
    const saveIntoDb = await receipt.save();
    res.status(StatusCodes.OK).json({
      message: `Receipt saved into Db successfully`,
      data: saveIntoDb,
    });
  } catch (err) {
    next(err);
  }
};

//UPDATE RECEIPT DATA
exports.updateReceipt = async (req, res, next) => {
  try {
    const id = req.params._id;
    console.log(id);
    const findReceipt = await Receipt.findById(id);
    if (!findReceipt) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No Receipt found` });
    }
    const payload = {
      valid: req.body.valid,
      notes: req.body.notes,
    };
    const updateRec = await Receipt.findByIdAndUpdate(id, payload);
    if (!updateRec) {
      return res
        .status(StatusCodes.NOT_MODIFIED)
        .json({ message: `Receipt is not updated` });
    }
    res
      .status(StatusCodes.OK)
      .json({ message: `Receipt updated successfully for user ${id}` });
  } catch (err) {
    next(err);
  }
};

//SINGLE RECEIPT DATA
exports.getSingleReceipts = async (req, res, next) => {
  try {
    console.log(req.params);
    const id = req.params._id;
    const findRec = await Receipt.findById(id);
    if (!findRec) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No Record found` });
    }
    res.status(201).json({ Receipt: findRec });
  } catch (err) {
    next(err);
  }
};

//GET VALID AND UNVALID RECEIPTS REQUIRE PARAMS
exports.getBulkRec = async (req, res, next) => {
  try {
    const parm = req.params.valid;
    const recType = parm == 0 ? true : false;
    const id = new mongoose.Types.ObjectId(req.userId);
    // console.log(recType);
    const findRec = await Receipt.aggregate([
      { $match: { $and: [{ userId: id }, { valid: recType }] } },
    ]);
    if (!findRec) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No record found` });
    }
    console.log(findRec);
    res.status(StatusCodes.OK).json({ data: findRec });
  } catch (err) {
    next(err);
  }
};

//RECEIPT ACCORDING TO ON WHICH USER CLICK
exports.getFolderRec = async (req, res, next) => {
  try {
    const folderId = new mongoose.Types.ObjectId(req.params.id);
    const user = new mongoose.Types.ObjectId(req.userId);
    console.log(user, folderId);
    const findRecs = await Receipt.aggregate([
      {
        $match: { $and: [{ folder: folderId }, { userId: user }] },
      },
    ]);
    res.status(StatusCodes.OK).json({ data: findRecs });
  } catch (err) {
    next(err);
  }
};

//FAVORITE RECEIPT CONTROLLER
exports.favRec = async (req, res, next) => {
  try {
    console.log(">>>>>>>>>>>>");
    const id = req.params._id;
    const { fav } = req.body;
    fav == 0
      ? await Receipt.findByIdAndUpdate(id, { favourite: true })
      : fav == 1
      ? await Receipt.findByIdAndUpdate(id, { favourite: false })
      : res
          .status(401)
          .json({ message: `Something went wrong,Please try again` });
    res
      .status(StatusCodes.OK)
      .json({ message: `Receipt set to ${fav == 0 ? true : false}` });
  } catch (err) {
    next(err);
  }
};

//GET FAVOURITE RECEIPTS FOR PARTICULAR USER
exports.getFav = async (req, res, next) => {
  try {
    const user_id = new mongoose.Types.ObjectId(req.userId);
    const findFav = await Receipt.aggregate([
      {
        $match: {
          $and: [{ userId: user_id }, { favourite: true }],
        },
      },
    ]);
    if (!findFav) {
      return res
        .status(StatusCodes.NO_CONTENT)
        .json({ message: `Add some receipts to favourite to see them here` });
    }
    res.status(StatusCodes.OK).json({ Receipts: findFav });
  } catch (err) {
    next(err);
  }
};
