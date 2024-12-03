const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  planStartDate: { 
    type: Date, 
    default: null 
  },
  planEndDate: { 
    type: Date, 
    default: null 
  },
  paymentDetails: {
    cardNumber: { 
      type: String, 
      default: null 
    },
    cvc: { 
      type: String, 
      default: null 
    },
    expiryDate: { 
      type: String, 
      default: null 
    },
  },
  password: { 
    type: String, 
    required: true 
  },
});

module.exports = mongoose.model('User', userSchema);
