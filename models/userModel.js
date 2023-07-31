const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
        telegramName : String,
        instagramName: String,
        startDate: String,
        endDate: String,
        phone: String,
        chatId: String,
        amount: Number,
        questions: [{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Question'
        }]
    }, {
        timestamps: true
    });

const User = mongoose.model('User', userSchema);

module.exports = User;