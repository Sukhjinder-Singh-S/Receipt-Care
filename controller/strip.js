"use strict";

const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");
const stripeFunctions = require("../helper/stripe");
const { SENDMAIL } = require("../helper/sendMail");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STIPE_API_KEY);

exports.stipePayment = async (req, res, next) => {
  try {
    const customer = await stripeFunctions.createCustomer(req);
    console.log(customer);

    req.customerId = customer.id;

    const subscription = await stripeFunctions.createSubscription(req);
    console.log(subscription);

    req.invoiceUrl = subscription.latest_invoice.hosted_invoice_url;

    let mailType;
    await SENDMAIL(null, (mailType = 3), req);

    res.status(StatusCodes.CREATED).json({
      message: `subscription has been created confirm it on frontend site`,
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      Url: subscription.latest_invoice.hosted_invoice_url,
    });
  } catch (err) {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: `` });
  }
};

exports.invoice_preview = async (req, res) => {
  try {
    console.log(req.params.subscriptionId);
    const subsRetrieve = await stripeFunctions.retriveSubscription(req);
    console.log(subsRetrieve);

    const invRetrieve = await stripeFunctions.invoiceUpcoming(
      req,
      subsRetrieve
    );
    res.status(StatusCodes.OK).json(invRetrieve);
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const cancel = await stripeFunctions.cancelSubscription(req);
    res
      .status(StatusCodes.OK)
      .json({ message: `Response for subscription cancel` });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }
};

exports.webhook = async (req, res) => {
  const sig = req.headers[`stripe-signature`];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.ENDPOINT_SECRET
    );
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  }

  const dataObject = event.data.object;

  switch (event.type) {
    case `invoice.payment_succeeded`:
      if (dataObject["billing_reason"] == "subscription_create") {
        console.log(
          `>>>>>>>>>>>>>> succeeded ${event.type} <<<<<<<<<<<<`,
          dataObject[`subscription`]
        );
      }
      break;

    case `customer.subscription.deleted`:
      console.log(`>>>>>>>>>> subscription has been deleted <<<<<<<<<<<`);
      break;

    case `invoice.payment_failed`:
      console.log(`>>>>>>>>>>>>>>> Payment failed ${event.type} <<<<<<<<<<<<<`);
      break;

    case `invoice.finalized`:
      console.log(
        `>>>>>>>>>>>>>>>invoice finalised ${event.type} for ${dataObject["invoice"]} <<<<<<<<<<<<<`
      );
      break;

    case "customer.subscription.deleted":
      if (event.request != null) {
        // handle a subscription cancelled by your request
        // from above.
      } else {
        // handle subscription cancelled automatically based
        // upon your subscription settings.
      }
      break;

    default:
      console.log(
        `>>>>>>>>>>>>>>>>>> unhandled event ${event.type} <<<<<<<<<<<<<<<<<`
      );
  }
  res.status(StatusCodes.OK).json({ received: true });
};
