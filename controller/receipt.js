const Receipt = require("../models/receipt");
const Folder = require("../models/folder");

exports.postReceipt = async (req, res) => {
  try {
    const findFolder = await Folder.findOne({ folderName: req.body.folder });
    const receipt = new Receipt({
      merchant: req.body.merchant,
      date: req.body.date,
      totalAmount: req.body.totalAmount,
      currency: req.body.currency,
      paymentMethod: req.body.paymentMethod,
      taxName1: req.body.taxName1,
      taxAmount1: req.body.taxAmount1,
      taxName2: req.body.taxName2,
      taxAmount2: req.body.taxAmount2,
      tipAmount: req.body.tipAmount,
      percentage: req.body.percentage,
      returnPolicy: req.body.returnPolicy,
      alert: req.body.alert,
      folder: findFolder._id,
      category: req.body.category,
      url: req.body.url,
      notes: req.body.notes,
      userId: req.userId,
      picture: req.body.picture,
      valid: false,
      barcode: req.body.barcode,
    });
    const saveIntoDb = await receipt.save();
    res
      .status(201)
      .json({
        message: `Receipt saved into Db successfully`,
        data: saveIntoDb,
      });
  } catch (err) {
    res.status(500).json({ message: `Some internal error occur` });
  }
};
