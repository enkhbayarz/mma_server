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
        const user = await User.findById(id);
  
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
        const user = await User.findOne({chatId: chatId});

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
  
  router.post('/', async(req, res) => {
  
    try {
        console.log(req.body)
        
        const { telegramName, instagramName, phone, chatId, questions } = req.body;

        const foundUser = await User.findOne({telegramName: telegramName});

        if(foundUser){
          foundUser.chatId = chatId;
          await foundUser.save()
          return res.status(200).json(foundUser) 
        }
 
        const newUser = new User({
            telegramName,
            instagramName,
            phone,
            chatId,
        });
 
        if (questions && questions.length > 0) {
            for (const q of questions) {
              const newQuestion = new Question({
                question1: q.question1,
                question2: q.question2,
                question3: q.question3,
                question4: q.question4,
              });
              await Question.create(newQuestion);
              newUser.questions
              newUser.questions.push(newQuestion);
            }
          }        
  
        await User.create(newUser)
  
        res.status(200).json(newUser)
  
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message}) 
    }
 
  })

  module.exports = router;