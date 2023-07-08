const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: "User_uploades",
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + "-" + file.originalname);
  },
});

const upload = multer({ storage: multerStorage }).single("pic");

module.exports = upload;
