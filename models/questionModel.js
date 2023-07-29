const mongoose = require('mongoose')

const questionSchema = mongoose.Schema({
        question1 : String,
        question2: String,
        question3: String,
        question4: String
    }, {
        timestamps: true
    });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;