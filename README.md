# Receipt-Care


first make a product on the stripe protal -------> take it's price id -----> create customer with needed field
------> Payment method (How customer is going to pay for our application) Typically used with the Payment Intents or Setup Intents APIs.------->create subscription for that particular user ---->   create invoice for that 
particular subscription and stripe will automatically send on user email ----> create payment intent


YOU ALSO NEED TO CREATE A EVENT WEBHOOK TO TRACK THE EVENTS THAT HAPPEN ON STRIPE
CREATE DIFFERENT FUNCTIONS TO SWITCH BETWEEN CASES 


FIRSTLY COLLECT USER INFORMATION LIKE USER EMAIL AND NAME THAT YOU WANT TO STORE IN CUSTOMER OBJECT FOR CREATION OF USER AND ALSO ATTACH A DEFAULT PAYMENT METHOD WITH USER


  const priceId = req.body.priceId;

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: priceId,
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
        res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });



    app.get('/invoice-preview', async (req, res) => {
  const customerId = req.cookies['customer'];
  const priceId = process.env[req.query.newPriceLookupKey.toUpperCase()];

  const subscription = await stripe.subscriptions.retrieve(
    req.query.subscriptionId
  );

  const invoice = await stripe.invoices.retrieveUpcoming({
    customer: customerId,
    subscription: req.query.subscriptionId,
    subscription_items: [ {
      id: subscription.items.data[0].id,
      price: priceId,
    }],
  });

  res.send({ invoice });
});


app.post('/cancel-subscription', async (req, res) => {
  // Cancel the subscription
  try {
    const deletedSubscription = await stripe.subscriptions.del(
      req.body.subscriptionId
    );

    res.send({ subscription: deletedSubscription });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

ON BACKEND YOU CREATE THE PAYMENT_INTENT AND INVOICE BY EXTENDED METHOD IN SUBSCRIPTION AND ON FRONTEND CONFIRM THE PAYMENT USING THE PRODUCT LINK  -------> THIS WILL BE USED AT THE TIME OF PAYMENT AND INVIOCE ARE COMPLETED IN EVENT WEBHOOK TO NOTIFY USER AND ALSO CAPTURE THE PAYMENT



  