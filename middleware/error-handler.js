"use strict";

const { StatusCodes } = require("http-status-codes");

exports.errorHandler = (err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || ` occur`;
  const data = err.data;
  res.status(status).json({ success: false, message: message, data: data });
  next();
};
