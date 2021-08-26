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
        extraFields: [mongoose.SchemaTypes.Mixed],
        _id: false,
    }],
    subtotal: {
        type: Number,
        default: 0
    },
    extraPrice: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    }
},{
    timestamps: true
});

module.exports = mongoose.model('shoppingChart', shoppingChartSchema);