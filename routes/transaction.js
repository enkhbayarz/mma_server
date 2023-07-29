const express = require('express');
let router = express.Router();
const Transaction = require('../models/transactionModel');

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user')
      .populate('product')
      .exec();
    res.status(200).json(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id)
      .populate('user')
      .populate('product')
      .exec();

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTransaction = await Transaction.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate('user')
      .populate('product')
      .exec();

    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await Transaction.findByIdAndDelete(id)
      .populate('user')
      .populate('product')
      .exec();

    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(deletedTransaction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      objectId,
      status,
      amount,
      qrText,
      user,
      product,
    } = req.body;

    const newTransaction = new Transaction({
      objectId,
      status,
      amount,
      qrText,
      user,
      product,
    });

    await Transaction.create(newTransaction);

    res.status(200).json(newTransaction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;