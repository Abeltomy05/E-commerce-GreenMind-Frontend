const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
 user: {
     type: mongoose.Schema.Types.ObjectId,
     ref:'User',
     required: true,
   },
  product: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'product',
      required: true,
    },
    quantity: {
        type: Number,
        default: 1,  
        min: 1  
      },
      variant: {
        size: { 
          type: String, 
          required: true 
        },
        price: { 
          type: Number, 
          required: true 
        }
      }
}, {
  timestamps: true  
});

module.exports = mongoose.models.Cart || mongoose.model("cart", cartSchema);
