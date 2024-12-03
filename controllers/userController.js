const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/authConfig');

exports.register = async (req, res) => {
    try {
      const { name, email, password, planStartDate, planEndDate, paymentDetails } = req.body;
  
      // Validate planStartDate and planEndDate
      if (!planStartDate || !planEndDate) {
        return res.status(400).json({ error: 'Plan start and end dates are required for payment processing.' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create the new user with the provided data
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        planStartDate,  // Use the provided start date
        planEndDate,    // Use the provided end date
        paymentDetails: paymentDetails || { cardNumber: null, cvc: null, expiryDate: null },  // Default empty values if no payment data
      });
  
      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
      res.status(400).json({ error: 'Registration failed.', details: error.message });
    }
  };
  

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: jwtExpiresIn });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed.', details: error.message });
  }
};

exports.getUser = async (req, res) => {
  res.json({ user: req.user });
};
