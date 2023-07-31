const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');

require('dotenv').config();

const userRoute = require('./routes/user');
const productRoute = require('./routes/product')
const couponRoute = require('./routes/coupon');
const qpayRoute = require('./routes/qpay');
const transactionRoute = require('./routes/transaction');
const extensionRoute = require('./routes/extension')

const app = express()

//midllewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static('public'));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/user', userRoute);
app.use('/product', productRoute);
app.use('/coupon', couponRoute);
app.use('/transaction', transactionRoute);
app.use('/extension', extensionRoute);
app.use('/', qpayRoute);

async function getUserList() {
  try {
    const response = await axios.get('https://mma-service.onrender.com/user');

    const userList = response.data; 

    const filteredUsers = userList.filter(user => {
      if(user.endDate){
        const endDate = moment(user.endDate, 'YYYY-MM-DD');
        const now = moment();
        const daysRemaining = endDate.diff(now, 'days');
        return daysRemaining === 273;
      }
      return false;
    });

    return filteredUsers;
  } catch (error) {
    console.error('Error fetching user list:', error.message);
    return []; // Return an empty array in case of an error
  }
}

async function sendMessageToBot(chatId, text) {
  try {
    const responseMessage = await axios.get(`https://api.telegram.org/bot6463008563:AAG5XPOwVdQv1BAWfY0aG96iEd7bZ6kG54Y/sendMessage?chat_id=${chatId}&text=${text}`);
    console.log(`Message sent to ${chatId}: ${text}`);
  } catch (error) {
    console.error(`Error sending message to ${chatId}:`, error.message);
  }
}

cron.schedule('02 22 * * *', async () => {
  const userList = await getUserList();

  const messageText = 'Хугацаань дуусаж байгаа учраас сунгалтаа хийгээрэй!!! /payment коммандыг ашиглаарай';

  userList.forEach((user) => {
    sendMessageToBot(user.chatId, messageText);
  });
});

mongoose.set('strictQuery', false);

mongoose.connect(process.env.DB_URL,{useNewUrlParser: true ,  useUnifiedTopology: true }).then( async () => {
    console.log(`MongoDb is connecting`)
    app.listen(process.env.PORT, () => {
      console.log(`Example app listening on port 3000`)
      });
});