const express = require("express");
const route = express.Router();
const stripeController = require("../controller/strip");
const isAuth = require("../middleware/isAuth");

//STRIPE PAYMENT ROUTES
route.post("/v1/customers", isAuth, stripeController.stipePayment);
route.get(
  "/invoice-preview/:subscriptionId",
  isAuth,
  stripeController.invoice_preview
);
route.post(
  "/webhook",
  express.raw({ type: `application/json` }),
  stripeController.webhook
);

module.exports = route;
