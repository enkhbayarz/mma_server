const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  objectId: String,
  status: String,
  amount: String,
  qrText: String,
  couponCode: String,
  user :{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User' 
    },
    product :{ 
      type: mongoose.Schema.Types.ObjectId,
       ref: 'Product' 
      },
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;