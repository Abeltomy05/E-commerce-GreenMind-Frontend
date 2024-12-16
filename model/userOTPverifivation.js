const mongoose = require('mongoose')

const UserOTPVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
      otp: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        required: true,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
      
})

module.exports =
  mongoose.models.UserOTPVerification ||
  mongoose.model("UserOTPVerification", UserOTPVerificationSchema);