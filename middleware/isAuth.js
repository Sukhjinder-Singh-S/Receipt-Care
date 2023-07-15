require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  //   console.log(req.headers.authorization + ` In Authentication router`);
  try {
    if (!req.headers.authorization) {
      return console.log("No header found"); //error handling
    }
    const verifyToken = jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.SECRET_KEY
    );
    console.log(verifyToken);
    req.userId = verifyToken.userId;
    req.premium = verifyToken.premium;
    req.name = verifyToken.name;
    req.email = verifyToken.email;
    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: `Some internal error occur,Please try again` });
  }
};
