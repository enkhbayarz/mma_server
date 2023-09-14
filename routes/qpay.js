const express = require('express')
let router = express.Router()
const axios = require('axios');
const moment = require('moment');
const uuid = require('uuid');

const User = require('../models/userModel')
const Product = require('../models/productModel')
const Transaction = require('../models/transactionModel')
const Extension = require('../models/extentensionModel');
const Coupon = require('../models/couponModel');
const Session = require('../models/session');

async function fetchToken() {
  try {

    const session = await Session.findById("64ffc9516d24cd0e55e3ad62");

    if(new Date().getTime() > (session.expires_in * 1000) + 15000) {
      const apiUrl = 'https://merchant.qpay.mn/v2/auth/token';
                       
      const username = 'TUGO116';
      const password = 'CpWIsFPK';
      const basicAuthHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  
      const config = {
        headers: {
          'Authorization': basicAuthHeader,
          'Content-Type': 'application/json',
        },
      };
      const requestBody = {
      };
      const response = await axios.post(apiUrl, requestBody, config);
      console.log(response.data)
  
      const tokenData = response.data;

      session.refresh_expires_in = tokenData.refresh_expires_in
      session.refresh_token = tokenData.refresh_token;
      session.access_token = tokenData.access_token;
      session.expires_in = tokenData.expires_in;
      session.createdAt = new Date().getTime();

      await session.save()
  
      return tokenData.access_token;
    }
    else {
      console.log("Token valid");
      return session.access_token;
    }
  
  } catch (error) {
    console.error('Error:', error.message);
    throw new Error('Failed to get the token.');
  }
}

router.post('/create-invoice/:chatId/:productId', async (req, res) => {
  try {
    const { chatId, productId } = req.params;

    const user = await User.findOne({chatId: chatId});

    if(!user){
      return res.status(404).json({message: "user not found!"})
    }
    console.log(user)

    const product = await Product.findById(productId)

    if(!product){
      return res.status(404).json({message: "product not found!"})
    }
    console.log(product)
    let amount = 0;

    if(user.amount){
      amount = user.amount * product.duration;
    } else {
      return res.status(404).json({message: "User's amount not found!"})
    }
    console.log(amount)

    const v4Uuid = uuid.v4();
    console.log("UUID v4:", v4Uuid);

    const data = {
      "invoice_code": "TUGO116_INVOICE",
      "sender_invoice_no": `${user.telegramName}`,
      "invoice_receiver_code": "83",
      "sender_branch_code": "BRANCH1",
      "invoice_description": `Order ${amount.toString()} ${user.telegramName}`,
      "enable_expiry": "false",
      "allow_partial": false,
      "minimum_amount": null,
      "allow_exceed": false,
      "maximum_amount": null,
      "amount": amount,
      "callback_url": `http://54.199.215.22:3000/call-back/${v4Uuid}`,
      "sender_staff_code": "online",
      "note": null,
      "invoice_receiver_data": {
          "register": "UK00240730",
          "name": "Enkhbayar Enkhorkhon",
          "email": "e.enkhbayat@gmail.com",
          "phone": "95059075"
      }
  };

  console.log(data)

  const token = await fetchToken();
  const url = 'https://merchant.qpay.mn/v2/invoice';

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.post(url, data, config);

    console.log('Response:', response.data);

    const transaction = new Transaction({
      status: 'NEW',
      objectId: response.data.invoice_id, 
      user: user, 
      amount: amount.toString(), 
      product: product,
      uid: v4Uuid
    });
    await transaction.save();

    res.status(200).json({
      status: 'success',
      data: {
        transaction: transaction,
        qrLink: response.data.qPay_shortUrl
      }
      });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to send invoice.' });
  }
});
  
  router.get('/call-back/:id', async (req, res) => {
  
    const { id } = req.params;

    const transaction = await Transaction.findOne({uid: id})
    if(!transaction){
      return res.status(404).json({message: "transaction not found!"})
    }
    console.log(transaction)

    if(transaction.status === 'PAID'){
      return res.status(404).json({message: "transaction already paid"}) 
    }

    const foundUser = await User.findById(transaction.user._id)

        if(!foundUser){
          return res.status(404).json({message: "user not found!"})
        } 

        const foundProduct = await Product.findById(transaction.product._id)
        if(!foundProduct){
          return res.status(404).json({message: "product not found!"})
        }
    
    const token = await fetchToken();
    const url = 'https://merchant.qpay.mn/v2/payment/check';
  
    const data = {
      "object_type" : "INVOICE",
      "object_id": transaction.objectId,
      "offset": {
          "page_number": 1,
          "page_limit": 100
      }
    };
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    try {
  
      const response = await axios.post(url, data, config);
      console.log('Response:', response.data);
  
      if (response.data.count === 1) {
        console.log('Payment is successful! Stopping callback service.');

        transaction.status = 'PAID';

        const currentDate = moment(foundUser.endDate, 'YYYY-MM-DD').toDate();

          const futureDate = moment(currentDate).add(foundProduct.duration, 'months').format('YYYY-MM-DD');

          console.log(`futureDate: ${futureDate}`)

          foundUser.endDate = futureDate

          const extension = new Extension({
            startDate: moment(currentDate).format('YYYY-MM-DD'), 
            endDate: futureDate, 
            product: foundProduct,
            user: foundUser
          })
          await extension.save();
       
        await foundUser.save();
        await transaction.save();

        const responseMessage = await axios.get(`https://api.telegram.org/bot6463008563:AAG5XPOwVdQv1BAWfY0aG96iEd7bZ6kG54Y/sendMessage?chat_id=${foundUser.chatId}&text=Төлбөр амжилттай төлөгдлөө`)

        res.status(200).json({
          status: 'success',
          data: response.data
        });
      } else {
        res.status(404).json({
          message: 'not payed', 
        })
      }
 
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Failed to call back.' });
    }
  });

  module.exports = router;