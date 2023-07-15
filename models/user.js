const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    premium: { type: Boolean },
    picture: { type: String },
    activeStatus: { type: Boolean ,default:true},
    loginDate:{type:Date},
    deviceType: { type: String, enum: ["android", "ios"] },
    otp: { type: Number },
  }
);

module.exports = mongoose.model("User", userSchema);
