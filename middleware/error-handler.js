exports.errorHandler = (err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({ success: false, message: message, data: data });
  next();
};
