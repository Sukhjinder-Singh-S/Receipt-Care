const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  merchantName: { type: String },
  cardNumber: { type: Number },
  cardNickName: { type: String },
  picture: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  type:{type:String}
});

module.exports = mongoose.model("card", cardSchema);
