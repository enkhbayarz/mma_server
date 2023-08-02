const mongoose = require('mongoose')

const questionSchema = mongoose.Schema({
    question_health : String,
    question_address : String,
    question_relation : String,
    question_money_flow: String,
    question_goal_1month: String,
    question_goal_1year: String,
    question_daily_routine: String
    }, {
        timestamps: true
    });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;