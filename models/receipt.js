const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const receiptSchema = new Schema(
  {
    merchant: { type: String },
    date: { type: Date },
    totalAmount: { type: Number },
    currency: { type: String },
    paymentMethod: { type: String },
    taxName1: { type: String },
    taxAmount1: { type: Number },
    taxName2: { type: String },
    taxAmount2: { type: Number },
    tipAmount: { type: Number },
    percentage: { type: Number },
    returnPolicy: { type: String },
    alert: { type: String },
    folder: { type: Schema.Types.ObjectId, ref: "folders" },
    category: { type: String },
    url: { type: String },
    notes: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    picture: { type: String },
    valid: { type: Boolean },
    barcode: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("receipt", receiptSchema);
