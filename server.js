const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

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

mongoose.set('strictQuery', false);

mongoose.connect(process.env.DB_URL,{useNewUrlParser: true ,  useUnifiedTopology: true }).then( async () => {
    console.log(`MongoDb is connecting`)
    app.listen(process.env.PORT, () => {
      console.log(`Example app listening on port 3000`)
      });
});


