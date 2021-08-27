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
    },
    image:{
        type: String,
    },
    products:{
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'product',
        default: []
    }
},{
    timestamps: true,
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
    },
    products:{
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'product',
        default: []
    }
},{
    timestamps: true,
    retainKeyOrder: true
});

const productSchema = mongoose.Schema({
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
    stock:{
        type: Number,
        required: true,
    },
    uploadedBy:{
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User'
    },
    maxOrder:{
        type: Number
    },
    //Indica si el objeto se puede comprar o no, se actualiza automaticamente si la cantidad es menor que 0
    active:{
        type: Boolean,
        default: true
    },
    category:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Category'
    },
    subcategory:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'subcategory'
    },
    shop:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'shop'
    },
    images: {
        type: [String]
    },
    labels: {
        type: [String],
    },
    extraFields:[{
        name: String,
        description: String,
        extraPrice: Number,
        values: {
            type: [mongoose.SchemaTypes.Mixed]
        }
        }
    ]
},{
    timestamps: true,
    retainKeyOrder: true
});

module.exports = {
    product: mongoose.model('product', productSchema),
    category: mongoose.model('Category', categorySchema),
    subcategory: mongoose.model('subcategory', subcategorySchema)
};