"use strict";

const { default: mongoose, Error } = require("mongoose");
const Card = require("../models/card");
const Folder = require("../models/folder");
const { StatusCodes } = require("http-status-codes");

//GET ALL CARD FROM THE DB
exports.getCards = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No user id found` });
    }
    const defaultCards = await Card.find({ type: "default" });
    const userCards = await Card.find({ userId: req.userId });
    res.status(StatusCodes.OK).json([...defaultCards, ...userCards]);
  } catch (err) {
    next(err);
  }
};

//POST USER CREATED CARD
exports.postCard = async (req, res, next) => {
  try {
    console.log(req.userId);
    const card = new Card({
      merchantName: req.body.merchantName,
      cardNumber: req.body.cardNumber,
      cardNickName: req.body.cardNickName,
      picture: req.body.picture,
      userId: req.userId,
    });
    const postCard = await card.save();
    if (!postCard) {
      return (
        res.status(StatusCodes.NOT_FOUND),
        json({ message: `Card item not posted` })
      );
    }
    res
      .status(StatusCodes.OK)
      .json({ message: `card saved successfully`, data: postCard });
  } catch (err) {
    next(err);
  }
};

//GET ALL FOLDERS FROM THE DATABASE
exports.getFolders = async (req, res, next) => {
  try {
    if (!req.userId) {
      const err = new Error("No id found");
      err.statusCode = StatusCodes.NOT_FOUND;
      throw err;
    }
    const defaultfolder = await Folder.find({ type: "default" });
    const userFolder = await Folder.find({
      userId: new mongoose.Types.ObjectId(req.userId),
    });
    if (!defaultfolder || !userFolder) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `Not folder found` });
    }
    res.status(StatusCodes.OK).json([...defaultfolder, ...userFolder]);
  } catch (err) {
    next(err);
  }
};

//POST FOLDER FOR A USER
exports.postFolder = async (req, res, next) => {
  try {
    console.log(req.userId);
    const folder = new Folder({
      folderName: req.body.folderName,
      icon: req.body.icon,
      userId: req.userId,
    });
    const postFolder = await folder.save();
    if (!postFolder) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `folder not posted` });
    }
    res
      .status(StatusCodes.OK)
      .json({ message: `Folder saved successfully`, data: postFolder });
  } catch (err) {
    next(err);
  }
};
