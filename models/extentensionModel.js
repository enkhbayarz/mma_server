const mongoose = require('mongoose');

const extensionSchema = mongoose.Schema({
  startDate: String,
  endDate: String,
  user :{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User' 
    },
    product :{ 
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Product' 
        },
}, {
    timestamps: true
});

const Extension = mongoose.model('Extension', extensionSchema);

module.exports = Extension;