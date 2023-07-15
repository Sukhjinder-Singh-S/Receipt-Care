const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51NM25ySDHZWobBACa5DiJWIkw7d2BQvAIWJG8pV4YYktQUyuPbBjhaMxz9EE7z3YSoB8xZS5Ob5ErH0HPiyzhnpv00rupdJsjO"
);

exports.createCustomer = async (req, res, next) => {
  try {
    console.log(">>>>>>>>>>> In stripe payment Api >>>>>>>>>>");
    console.log(req.email, req.name, req.userId);
    const customer = await stripe.customers.create({
      name: req.name,
      email: req.email,
      description: `A new Stripe customer with id ${req.userId}`,
      metadata: {
        userIdDb: req.userId,
      },
      payment_method: req.body.payment_method,
    });
    if (!customer) {
      const err = new Error("Some internale error occur");
      err.statusCode = 401;
      throw err;
    }
    console.log(customer);
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: "Generata a price id form the product" }],
      billing: "charge_automatically",
      billing_cycle_anchor: "now",
      proration_behavior: "none",
      billing_cycle: "month",
    });
    res.status(201).json(customer);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
