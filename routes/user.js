const express = require('express')
let router = express.Router()
const User = require('../models/userModel')
const Question = require('../models/questionModel')

//User
router.get('/', async(req, res) => {
    try {
  
        const user = await User.find().populate('questions').exec();
        res.status(200).json(user);
  
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
  })
 
  router.get('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id).populate('questions').exec();
  
        res.status(200).json(user);
  
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
  })

  router.get('/username/:username', async(req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({telegramName: username});
 
        res.status(200).json(user);
  
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
  }) 

  router.get('/chatId/:chatId', async(req, res) => {
    try {
        const {chatId} = req.params;
        const user = await User.findOne({chatId: chatId}).populate('questions').exec();

        res.status(200).json(user);
 
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
  }) 

  router.put('/:id', async(req, res) => {
  
    try {
        const {id} = req.params;
        const user = await User.findByIdAndUpdate(id, req.body)
  
        if(!user){
            return res.status(404).json({message: "user not found"})
        }
        const updatedUser = await User.findById(id);
  
        res.status(200).json(updatedUser)
  
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
  
  })
  
  router.delete('/:id', async(req, res) => {
  
    try {
      const {id} = req.params;
        const user = await User.findByIdAndDelete(id, req.body)
  
        if(!user){
          return res.status(404).json({message: "user not found"})
        }
  
        res.status(200).json(user)
  
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
  
  })
  //anh start daraad orj irhed chat_id telegramName 2 iig avaad hereglegchee uusgej bgaa
  router.post('/', async(req, res) => {
  
    try {
        console.log(req.body)
        
        const { telegramName, chatId } = req.body;

        const foundUser = await User.findOne({telegramName: telegramName});

        if(foundUser){
          foundUser.chatId = chatId;
          await foundUser.save()
          return res.status(200).json(foundUser) 
        } else {
          const newUser = new User({
            telegramName,
            chatId,
          });

          await User.create(newUser)
    
          res.status(200).json(newUser)
    
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
 
  })
 
  router.post('/full', async(req, res) => {
  
    try {
        console.log(req.body)
        
        const { instagramName, phone, chatId, questions } = req.body;

        const foundUser = await User.findOne({chatId: chatId});

        console.log(foundUser)

        if(foundUser){
          foundUser.instagramName = instagramName
          foundUser.phone = phone

          const newQuestion = new Question({
            question_health: questions.question_health,
            question_address: questions.question_address,
            question_relation: questions.question_relation,
            question_money_flow: questions.question_money_flow,
            question_goal_1month: questions.question_goal_1month,
            question_goal_1year: questions.question_goal_1year,
            question_daily_routine: questions.question_daily_routine
          });

          foundUser.questions = newQuestion
          await Question.create(newQuestion);
          await foundUser.save()
          return res.status(200).json(foundUser) 
        }
        return res.status(404).json({message: "user not found"})
  
  
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
 
  })

  module.exports = router;