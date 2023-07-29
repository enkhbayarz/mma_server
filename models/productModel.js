const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  amount: Number,
  dateType: String,
  duration: Number
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;