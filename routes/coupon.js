const express = require('express')
let router = express.Router()
const Coupon = require('../models/couponModel')
const User = require('../models/userModel');

//Coupon
router.post('/generate/:id', async(req, res) => {

    try {
       
        const {id} = req.params;
        const user = await User.findById(id);
  
        if(!user){
          return res.status(404).json({message: "user not found"})
        }
        const foundCoupon = await Coupon.findOne({generatedUser : user._id});
  
       if(foundCoupon){
        return res.status(404).json({message: "user already generated Coupon"})
       }
  
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        const couponCode = `${user.telegramName.slice(0, 4)}${randomNumber}`.toUpperCase();
  
        const newCoupon = new Coupon({ code: couponCode, generatedUser: user });
        await newCoupon.save();
  
        res.status(200).json(newCoupon)
  
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
  
  })
  
  router.post('/:id/:coupon', async(req, res) => {
  
    try {
       
        const {id, coupon} = req.params;
        const user = await User.findById(id);
  
        if(!user){
          return res.status(404).json({message: "user not found!"})
        }
        console.log(user)
        const foundCoupon = await Coupon.findOne({code : coupon});
  
       if(!foundCoupon){
        return res.status(404).json({message: "coupon code not found!"})
       }
  
       console.log(foundCoupon)
  
       if(foundCoupon.generatedUser._id.equals(user._id)){
        return res.status(404).json({message: "you can't use your own coupon code"})
       }
  
       if (foundCoupon.usedUser.includes(user._id)) {
        return res.status(400).json({ message: "User has already used this coupon!" });
      }
  
       foundCoupon.usedUser.push(user)
       await foundCoupon.save();
  
      res.status(200).json({
        status: 'success',
        data: foundCoupon
        })
  
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
  
  })
  
  router.get('/', async(req, res) => {
    try {
  
        const coupon = await Coupon.find({});
        res.status(200).json({
          status: 'success',
          data: coupon
          });
  
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
  })

  module.exports = router;