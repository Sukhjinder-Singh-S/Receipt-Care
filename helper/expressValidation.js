const { body } = require("express-validator");

exports.VALIDATOR = {
  USER_SIGNUP: [
    body("name").exists().isString().isLength({ min: 4 }),
    body("email", "Invalid email type").isEmail(),
    body("password", "Password must be 8 digit long,include num,alphabet and symbol")
      .exists()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }),
  ],

  USER_LOGIN: [
    body("email", "Invalid email type").isEmail(),
    body("password", "Please enter a valid password").exists(),
  ],

  USER_UPDATE: [
    body("name").exists().isString().isLength({ min: 4 }),
    body("email", "Invalid email type").isEmail(),
  ],
  USER_FORGOTPASS: [body("email", "Invalid email type").isEmail()],
  USER_RESETPASS: [
    body("newPassword", "Password must be 8 digit long,which include num,alphabet and symbol")
      .exists()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
  ],
  RECEIPT_POST: [
    body("merchant", "Merchant name is missing").exists(),
    body("date", "Must be an ISO date").exists(),
    body("totalAmount", "Must be number").isNumeric().exists(),
    body("currency", "").exists(),
    body("paymentMethod", "Please select a payment method").exists(),
    body("taxName1", "Enter a tax name").exists(),
    body("taxAmount1", "Enter taxAmount").exists(),
    body("taxName2", "Enter a tax name").exists(),
    body("taxAmount2", "Enter taxAmount").exists(),
    body("folder", "Select a folder to save receipt").exists(),
  ],
};
