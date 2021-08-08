const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity:{
        type: Number,
        required: true,
    }
},{
    timeStamps: true
});

module.exports = mongoose.model('item', itemSchema);