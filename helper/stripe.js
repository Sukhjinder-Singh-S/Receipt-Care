"use strict";

require("dotenv").config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STIPE_API_KEY);

const stripeFunctions = {};

stripeFunctions.createCustomer = async (req) => {
  const { email, name, userId } = req;
  const customer = await stripe.customers.create({
    email: email,
    name: name,
    metadata: {
      userId: userId,
    },
    // payment_method:'id of payment method' //optional by default
  });
  return customer;
};

stripeFunctions.createSubscription = async (req) => {
  const priceId = process.env.TEST_PRICE;
  const create_subscription = await stripe.subscriptions.create({
    customer: req.customerId,
    items: [
      {
        price: priceId,
      },
    ],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });
  return create_subscription;
};

stripeFunctions.retriveSubscription = async (req) => {
  const subscription = await stripe.subscriptions.retrieve(
    req.params.subscriptionId
  );
  return subscription;
};

stripeFunctions.cancelSubscription = async (req) => {
  const cancel_subscription = await stripe.subscriptions.cancel(
    req.subscriptionId
  );
  return cancel_subscription;
};

stripeFunctions.invoiceUpcoming = async (req, subsRetrieve) => {
  const priceId = process.env.TEST_PRICE;
  const invoice = await stripe.invoices.retrieveUpcoming({
    customer: req.customerId,
    subscription: req.params.subscriptionId,
    subscription_items: [
      {
        id: subsRetrieve.items.data[0].id,
        price: priceId,
      },
    ],
  });
  return invoice;
};

module.exports = stripeFunctions;
