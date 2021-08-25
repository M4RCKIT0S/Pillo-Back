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
        _id: false,
        default: []
    }],
    totalPrice: {
        type: Number,
        default: 0
    }
},{
    timestamps: true
});

module.exports = mongoose.model('shoppingChart', shoppingChartSchema);