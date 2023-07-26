"use strict";

require("dotenv").config();
const Folder = require("../models/folder");
const Card = require("../models/card");

exports.folders = [
  {
    folderName: "folder 1",
    icon: "https://cdn-icons-png.flaticon.com/512/5994/5994710.png",
    type: "default",
  },
  {
    folderName: "folder 2",
    icon: "https://cdn-icons-png.flaticon.com/512/5994/5994710.png",
    type: "default",
  },
  {
    folderName: "folder 3",
    icon: "https://cdn-icons-png.flaticon.com/512/5994/5994710.png",
    type: "default",
  },
  {
    folderName: "folder 4",
    icon: "https://cdn-icons-png.flaticon.com/512/5994/5994710.png",
    type: "default",
  },
];

exports.cards = [
  {
    merchantName: "CAA",
    cardNumber: process.env.CARD1, //card number from .env file
    cardNickName: "CAA",
    type: "default",
    picture:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Creative_Artists_Agency_logo_%28no_text%29.svg/2560px-Creative_Artists_Agency_logo_%28no_text%29.svg.png",
  },
  {
    merchantName: "Air Miles",
    cardNumber: process.env.CARD2, //card number from .env file
    cardNickName: "Air Miles",
    type: "default",
    picture:
      "https://fiu-original.b-cdn.net/fontsinuse.com/use-images/77/77547/77547.png?filename=Air-Miles-brings-you-closer.png",
  },
  {
    merchantName: "American Eagle Outfitters",
    cardNumber: process.env.CARD3, //card number from .env file
    cardNickName: "American Eagle Outfitters",
    type: "default",
    picture: "https://wallpaperaccess.com/full/3874814.jpg",
  },
  {
    merchantName: "Costco Wholesale",
    cardNumber: process.env.CARD4, //card number from .env file
    cardNickName: "Costco Wholesale",
    type: "default",
    picture:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Costco_Wholesale_logo_2010-10-26.svg/2560px-Costco_Wholesale_logo_2010-10-26.svg.png",
  },
  {
    merchantName: "Tim Hortons",
    cardNumber: process.env.CARD5, //card number from .env file
    cardNickName: "Timmy",
    type: "default",
    picture:
      "https://1000logos.net/wp-content/uploads/2023/04/Tim-Hortons-Logo-1990.png",
  },
];

exports.defaultInsert = async () => {
  let folderCount = await Folder.countDocuments({});
  let cardCount = await Card.countDocuments({});
  if (folderCount <= 0) {
    await Folder.insertMany(this.folders);
  }
  if (cardCount <= 0) {
    await Card.insertMany(this.cards);
  }
};
