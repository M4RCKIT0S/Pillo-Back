const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
    },
    subcategories: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'Category',
        default: []
    }
},{
    timeStamps: true
});

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description:{
        type: String, 
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    quantity:{
        type: Number,
        required: true,
    },
    uploadedBy:{
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User'
    },
    //Indica si el objeto se puede comprar o no, se actualiza automaticamente si la cantidad es menor que 0
    active:{
        type: Boolean,
    },
    categroies:{
        type:[mongoose.SchemaTypes.ObjectId],
        ref: 'Category'
    }
},{
    timeStamps: true
});

module.exports = {
    item: mongoose.model('item', itemSchema),
    category: mongoose.model('Category', categorySchema)
};