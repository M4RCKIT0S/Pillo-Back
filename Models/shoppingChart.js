const mongoose = require('mongoose');

const shoppingChartSchema = mongoose.Schema({
    user:{
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'user'
    },
    products:[{
        product:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'product'
        },
        quantity: Number,
        default: []
    }],
},{
    timeStamps: true
});

module.exports = mongoose.model('shoppingChart', shoppingChartSchema);