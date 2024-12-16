const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false
  },
 user: {
     type: mongoose.Schema.Types.ObjectId,
     ref:'User',
     required: true,
   },
}, {
  timestamps: true  
});

module.exports = mongoose.models.Address || mongoose.model("Address", addressSchema);
