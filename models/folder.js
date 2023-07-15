const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const folderSchema = new Schema({
  folderName: { type: String },
  icon: { type: String },
  type:{type:String},
  userId: { type: Schema.Types.ObjectId, ref: "users" },
});

module.exports = mongoose.model("folder", folderSchema);
