const express = require("express");
const route = express.Router();

const cardAndFolder = require("../controller/card&folder");
const isAuth = require("../middleware/isAuth");

route.get("/getCards", isAuth, cardAndFolder.getCards);
route.post("/postCard", isAuth, cardAndFolder.postCard);
route.get("/getFolders", isAuth, cardAndFolder.getFolders);
route.post("/postFolder", isAuth, cardAndFolder.postFolder);

module.exports = route;
