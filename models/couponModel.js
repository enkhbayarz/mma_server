const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
  code: String,
  generatedUser :{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User' 
    },
  usedUser: [{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User' 
    }],
}, {
    timestamps: true
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;