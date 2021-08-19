const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
    },
    description:{
        type: String,
    },
    subcategories: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'subcategory',
        default: []
    }
},{
    timeStamps: true,
    retainKeyOrder: true
});
const subcategorySchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
    },
    upperCategory: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Category',
        required: true,
    }
},{
    timeStamps: true,
    retainKeyOrder: true
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
    categories:{
        type:[mongoose.SchemaTypes.ObjectId],
        ref: 'Category'
    }
},{
    timeStamps: true,
    retainKeyOrder: true
});

module.exports = {
    item: mongoose.model('item', itemSchema),
    category: mongoose.model('Category', categorySchema),
    subcategory: mongoose.model('subcategory', subcategorySchema)
};