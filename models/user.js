const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  premium: { type: Boolean, default: false },
  picture: { type: String },
  activeStatus: { type: Boolean, default: true },
  loginDate: { type: Date },
  deviceType: { type: String, enum: ["android", "ios"] },
  mediaId: { type: String },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
