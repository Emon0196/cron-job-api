const jwt = require('jsonwebtoken');
const User = require('../models/User');
const paymentProcessor = require('../cron/paymentProcessor'); // Import the payment processor

module.exports = async (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.headers['authorization'];

  // If no token is provided, return an error response
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user based on the decoded token's user ID
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      throw new Error('User not found.');
    }

    // If the user is found, check if it's the `/test-payment` route
    if (req.originalUrl === '/test-payment') {
      try {
        // Trigger the payment processor logic
        await paymentProcessor();
        res.status(200).send('Payment processing test completed!');
      } catch (error) {
        res.status(500).json({ error: 'Error during payment processing test.' });
      }
    } else {
      // Proceed to the next middleware or route handler
      next();
    }
  } catch (err) {
    // If token verification fails or user is not found, return an error response
    res.status(401).json({ error: 'Invalid token.' });
  }
};
