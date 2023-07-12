const express = require('express');
const route = express.Router();

const receiptController = require('../controller/receipt');
const isAuth = require('../middleware/isAuth')


route.post('/post', isAuth, receiptController.postReceipt);



module.exports = route