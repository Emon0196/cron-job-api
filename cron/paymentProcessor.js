const cron = require('node-cron');
const User = require('../models/User');
const APIContracts = require('authorizenet').APIContracts;
const APIControllers = require('authorizenet').APIControllers;

// Initialize the merchant authentication details for Authorize.Net
const merchantAuthentication = new APIContracts.MerchantAuthenticationType();
merchantAuthentication.setName(process.env.AUTHORIZE_NET_API_LOGIN_ID);
merchantAuthentication.setTransactionKey(process.env.AUTHORIZE_NET_TRANSACTION_KEY);

// Function to process payment for a user
const chargeUser = async (user) => {
  try {
    const creditCard = new APIContracts.CreditCardType();
    creditCard.setCardNumber(user.paymentDetails.cardNumber);
    creditCard.setExpirationDate(user.paymentDetails.expiryDate); // Format: YYYY-MM
    creditCard.setCardCode(user.paymentDetails.cvc);

    const paymentType = new APIContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const transactionRequest = new APIContracts.TransactionRequestType();
    transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequest.setAmount(97.0); // Subscription fee
    transactionRequest.setPayment(paymentType);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthentication);
    createRequest.setTransactionRequest(transactionRequest);

    const controller = new APIControllers.CreateTransactionController(createRequest.getJSON());

    // Execute the request and handle the response
    controller.execute(() => {
      const response = controller.getResponse();

      if (response && response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
        console.log(`Payment successful for user: ${user.email}`);

        // Update the user's planEndDate (extend the subscription by 30 days)
        User.findByIdAndUpdate(user._id, { 
          planEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active' // Ensure the user status is 'active' after successful payment
        }, (err, updatedUser) => {
          if (err) {
            console.error(`Error updating user ${user.email}:`, err);
          } else {
            console.log(`User ${updatedUser.email} subscription updated to active.`);
          }
        });
      } else {
        console.error(`Payment failed for user: ${user.email}`);

        // Log the errors from the transaction response
        const errors = response.getTransactionResponse().getErrors();
        console.error('Payment failure details:', errors);

        // Update user status to 'inactive' if payment fails
        User.findByIdAndUpdate(user._id, { status: 'inactive' }, (err, updatedUser) => {
          if (err) {
            console.error(`Error updating user ${user.email} to inactive:`, err);
          } else {
            console.log(`User ${updatedUser.email} status updated to inactive due to failed payment.`);
          }
        });
      }
    });
  } catch (error) {
    console.error(`Error processing payment for user: ${user.email}`, error);
  }
};

// Payment processor function to run the cron job
const paymentProcessor = async () => {
  console.log('Running payment processor...');

  // Find active users whose plans have expired
  const users = await User.find({ status: 'active', planEndDate: { $lte: new Date() } });

  if (users.length === 0) {
    console.log('No active users with expired plans to process payments for.');
  }

  // Process payment for each eligible user
  for (const user of users) {
    await chargeUser(user);
  }
};

// Schedule the cron job to run every day at midnight
cron.schedule('0 0 * * *', paymentProcessor); // Cron job runs daily at midnight

module.exports = paymentProcessor;
