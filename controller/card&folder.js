const { default: mongoose, Error } = require("mongoose");
const Card = require("../models/card");
const Folder = require("../models/folder");

//GET ALL CARD FROM THE DB
exports.getCards = async (req, res, next) => {
  try {
    if (!req.userId) {
      const err = new Error("No user id found");
      err.statusCode = 404;
      throw err;
    }
    const defaultCards = await Card.find({ type: "default" });
    const userCards = await Card.find({ userId: req.userId });
    res.status(201).json([...defaultCards, ...userCards]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
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
      const err = new Error("Card item not posted");
      err.statusCode = 404;
      throw err;
    }
    res
      .status(201)
      .json({ message: `card saved successfully`, data: postCard });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//GET ALL FOLDERS FROM THE DATABASE
exports.getFolders = async (req, res, next) => {
  try {
    if (!req.userId) {
      const err = new Error("No id found");
      err.statusCode = 404;
      throw err;
    }
    const defaultfolder = await Folder.find({ type: "default" });
    const userFolder = await Folder.find({
      userId: new mongoose.Types.ObjectId(req.userId),
    });
    if (!defaultfolder || !userFolder) {
      const err = new Error(`Not folder found`);
      err.statusCode = 404;
      throw err;
    }
    res.status(201).json([...defaultfolder, ...userFolder]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
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
      const err = new Error("folder not posted");
      err.statusCode = 404;
      throw err;
    }
    res
      .status(201)
      .json({ message: `Folder saved successfully`, data: postFolder });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
