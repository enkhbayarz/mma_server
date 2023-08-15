const express = require('express')
let router = express.Router()
const Product = require('../models/productModel')
const User = require('../models/userModel')

//Product
router.get('/', async (req, res) => {
    try {
      const products = await Product.find();
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch products.' });
    }
  });
  
  // Get a specific product by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch the product.' });
    }
  });

  router.get('/chatid/:chatId', async (req, res) => {
    try {
      const { chatId } = req.params;

      const user = await User.findOne({chatId: chatId});

      let products = await Product.find();

      if (user) {
        // Update the amount field of all products to the user's amount
        const userAmount = user.amount;
        products = products.map(product => {
          return { ...product.toObject(), amount: userAmount };
        });
      }
  
      res.status(200).json(products);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch the product.' });
    }
  });

  // Update a product by ID
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update the product.' });
    }
  });
  
  // Delete a product by ID
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete the product.' });
    }
  });
  
  // Create a new product
  router.post('/', async (req, res) => {
    try {
      const { amount, dateType, duration } = req.body;
  
      const newProduct = new Product({
        amount,
        dateType,
        duration,
      });
  
      await newProduct.save();
  
      res.status(200).json(newProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create the product.' });
    }
  });

  module.exports = router;