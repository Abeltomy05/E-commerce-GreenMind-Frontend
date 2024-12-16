const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim:true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false, 
  },
  refreshToken: {
    type: String,
  },
  googleId: {
    type: String,
    default: null,
  },
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true  
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
