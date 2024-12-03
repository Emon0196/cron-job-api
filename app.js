require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const errorHandler = require('./utils/errorHandler'); // Import custom error handler
const paymentProcessor = require('./cron/paymentProcessor'); // Import the cron job

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses JSON bodies

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes); // User-related routes

app.get('/test-payment', async (req, res) => {
  try {
    // Manually trigger the payment processor
    await paymentProcessor();
    res.status(200).send('Payment processing successfully triggered!');
  } catch (error) {
    console.error('Payment processing error:', error); // Log the error for debugging
    res.status(500).send('Error during payment processing.');
  }
});

// Error Handling Middleware
app.use(errorHandler);

// Server Initialization
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});
