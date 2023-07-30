const express = require('express')
let router = express.Router()
const axios = require('axios');
const moment = require('moment');

const User = require('../models/userModel')
const Product = require('../models/productModel')
const Transaction = require('../models/transactionModel')
const Extension = require('../models/extentensionModel')

async function fetchToken() {
  try {
    // API URL
    const apiUrl = 'https://merchant-sandbox.qpay.mn/v2/auth/token';

    // Basic Auth credentials
    const username = 'TEST_MERCHANT';
    const password = '123456';
    const basicAuthHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

    // Request body (if needed)
    const requestBody = {
      // Add any request body data if required by the API
    };

    // Request config with headers and basic auth
    const config = {
      headers: {
        'Authorization': basicAuthHeader,
        'Content-Type': 'application/json',
      },
    };

    // Make the POST request
    const response = await axios.post(apiUrl, requestBody, config);
    console.log(response.data)

    // Get the token data from the response
    const tokenData = response.data;

    return tokenData.access_token;

    //const token = await fetchToken();
  } catch (error) {
    console.error('Error:', error.message);
    throw new Error('Failed to get the token.');
  }
}

router.post('/create-invoice/:chatId/:productId/:coupon', async (req, res) => {
  try {
    const { chatId, productId, coupon } = req.params; 

    const user = await User.findOne({chatId: chatId});

    if(!user){
      return res.status(404).json({message: "user not found!"})
    }

    const product = await Product.findById(productId)

    if(!product){
      return res.status(404).json({message: "product not found!"})
    }
    console.log(product)
    let amount = 0;

    if(user.amount){
      amount = user.amount * product.duration;
    } else {
      amount = product.amount * product.duration;
    }
    console.log(amount)

    const data = {
      "invoice_code": "TEST1_INVOICE",
      "sender_invoice_no": "MABNK000001",
      "invoice_receiver_code": "83",
      "sender_branch_code": "BRANCH1",
      "invoice_description": "Order No1311 4444.00",
      "enable_expiry": "false",
      "allow_partial": false,
      "minimum_amount": null,
      "allow_exceed": false,
      "maximum_amount": null,
      "amount": amount,
      "callback_url": "https://bd5492c3ee85.ngrok.io/payments?payment_id=12345678",
      "sender_staff_code": "online",
      "note": null,
      "invoice_receiver_data": {
          "register": "UZ96021178",
          "name": "Dulguun",
          "email": "dulguun@gmail.com",
          "phone": "88789856"
      },
      "transactions": [
          {
              "description": "gg",
              "amount": amount.toString(),
              "accounts": [
                  {
                      "account_bank_code": "390000",
                      "account_name": "аззаяа",
                      "account_number": "8000101230",
                      "account_currency": "MNT",
                      "is_default": true
                  }
              ]
          }
          
      ]
  };

  const token = await fetchToken();
  const url = 'https://merchant-sandbox.qpay.mn/v2/invoice';

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
      qrText: response.data.qr_text,
      product: product,
      couponCode: coupon
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

router.post('/create-invoice/:chatId/:productId', async (req, res) => {
  try {
    const { chatId, productId } = req.params; 

    const user = await User.findOne({chatId: chatId});

    if(!user){
      return res.status(404).json({message: "user not found!"})
    }

    const product = await Product.findById(productId)

    if(!product){
      return res.status(404).json({message: "product not found!"})
    }
    console.log(product)
    let amount = 0;

    if(user.amount){
      amount = user.amount * product.duration;
    } else {
      amount = product.amount * product.duration;
    }
    console.log(amount)

    const data = {
      "invoice_code": "TEST1_INVOICE",
      "sender_invoice_no": "MABNK000001",
      "invoice_receiver_code": "83",
      "sender_branch_code": "BRANCH1",
      "invoice_description": "Order No1311 4444.00",
      "enable_expiry": "false",
      "allow_partial": false,
      "minimum_amount": null,
      "allow_exceed": false,
      "maximum_amount": null,
      "amount": amount,
      "callback_url": "https://bd5492c3ee85.ngrok.io/payments?payment_id=12345678",
      "sender_staff_code": "online",
      "note": null,
      "invoice_receiver_data": {
          "register": "UZ96021178",
          "name": "Dulguun",
          "email": "dulguun@gmail.com",
          "phone": "88789856"
      },
      "transactions": [
          {
              "description": "gg",
              "amount": amount.toString(),
              "accounts": [
                  {
                      "account_bank_code": "390000",
                      "account_name": "аззаяа",
                      "account_number": "8000101230",
                      "account_currency": "MNT",
                      "is_default": true
                  }
              ]
          }
          
      ]
  };

  const token = await fetchToken();
  const url = 'https://merchant-sandbox.qpay.mn/v2/invoice';

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
      qrText: response.data.qr_text,
      product: product
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
  
  router.post('/call-back/:id', async (req, res) => {
  
    const { id } = req.params;
  
    const token = await fetchToken();
    const url = 'https://merchant-sandbox.qpay.mn/v2/payment/check';
  
    const data = {
      "object_type" : "INVOICE",
      "object_id": id,
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
  
      if (response.data.count === 0) {
        console.log('Payment is successful! Stopping callback service.');
  
        const transaction = await Transaction.findOne({objectId: id})
        if(!transaction){
          return res.status(404).json({message: "transaction not found!"})
        }
        console.log(transaction)
        const foundUser = await User.findById(transaction.user._id)

        if(!foundUser){
          return res.status(404).json({message: "user not found!"})
        } 

        if(transaction.status === 'PAID'){
          return res.status(404).json({message: "transaction already paid"}) 
        }
        transaction.status = 'PAID';
      
        const foundExtentension = await Extension.findOne({user: transaction.user._id});
        console.log(`foundExtentension: ${foundExtentension}`)
  
        if(!foundExtentension){
          const currentDate = new Date();
          console.log(moment(currentDate).format('YYYY-MM-DD'));
  
          const addedDate = moment(currentDate).add(transaction.product.duration, 'months').format('YYYY-MM-DD');

          console.log(addedDate)
  
          const extension = new Extension({
            startDate: moment(currentDate).format('YYYY-MM-DD'), 
            endDate:addedDate, 
            product: transaction.product,
            user: transaction.user
          })
          await extension.save();
        } else {
          const currentDate = moment(foundExtentension.endDate, 'YYYY-MM-DD').toDate();
          console.log(currentDate);

          const futureDate = moment(currentDate).add(transaction.product.duration, 'months').format('YYYY-MM-DD');

          console.log(`futureDate: ${futureDate}`)

          const extension = new Extension({
            startDate: moment(currentDate).format('YYYY-MM-DD'), 
            endDate: futureDate, 
            product: transaction.product,
            user: transaction.user
          })
          await extension.save();
        }
        if(!foundUser.amount){
          foundUser.amount = transaction.product.amount;
          await foundUser.save();
        }

        await transaction.save();

        if(transaction.couponCode){
          const responseCoupon = await axios.post(`http://localhost:3000/coupon/${transaction.user._id}/${transaction.couponCode}`);
          console.log(responseCoupon.data)
        }
      
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