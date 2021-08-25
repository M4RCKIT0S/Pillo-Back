const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
    },
    products: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'product',
        default: []
    }
},{
    timestamps: true,
    retainKeyOrder: true
});

module.exports = mongoose.model('shop', shopSchema);