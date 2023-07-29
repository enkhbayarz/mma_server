const express = require('express');
let router = express.Router();
const Extension = require('../models/extentensionModel');

router.get('/', async (req, res) => {
  try {
    const extensions = await Extension.find()
      .populate('user')
      .populate('product')
      .exec();
    res.status(200).json(extensions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const extension = await Extension.findById(id)
      .populate('user')
      .populate('product')
      .exec();

    if (!extension) {
      return res.status(404).json({ message: 'Extension not found' });
    }

    res.status(200).json(extension);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExtension = await Extension.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate('user')
      .populate('product')
      .exec();

    if (!updatedExtension) {
      return res.status(404).json({ message: 'Extension not found' });
    }

    res.status(200).json(updatedExtension);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExtension = await Extension.findByIdAndDelete(id)
      .populate('user')
      .populate('product')
      .exec();

    if (!deletedExtension) {
      return res.status(404).json({ message: 'Extension not found' });
    }

    res.status(200).json(deletedExtension);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      user,
      product,
    } = req.body;

    const newExtension = new Extension({
      startDate,
      endDate,
      user,
      product,
    });

    await Extension.create(newExtension);

    res.status(200).json(newExtension);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
