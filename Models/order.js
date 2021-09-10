const mongoose = require('mongoose');

const orderSchema =  mongoose.Schema({
    userName: String,
    orderNumber:{
        type: Number,
        required: false
    },
    status: {
        key: Number,
        value: String
    },
    user:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    phone:{
        type: Number,
        required: true,
    },
    products:[{
        productId:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'product'
        },
        quantity: Number,
        variant: mongoose.SchemaTypes.Mixed,
        _id: false
    }],
    shops:{
        type:Number,
    },
    paymentMethod:{
        type: String,
        default: 'cash',
        enum:['cash', 'card', 'bizum']
    },
    address:{
        street: String,
        city: String,
        postalCode: {
            type: Number, 
            validate: [validatePostalCode, 'Please fill a valid postal code.']
        }
    },
    subtotal:{
        type: Number,
        default: 0
    },
    tip:{
        type: Number,
        default: 0
    },
    total:{
        type: Number,
    },
    notes: String
},{
    timestamps: true
})
const counterSchema = mongoose.Schema({
    _id:{
        type:String,
        required: true,
    },
    seq: {
        type: Number,
        default: 0
    }
})
var counter = mongoose.model('counter', counterSchema);
orderSchema.pre('save', function(next){
    var doc = this;
    counter.findOneAndUpdate({},{$inc:{seq:1}},{new: true, upsert: true} ,(err, updatedCounter)=>{
        if(err) return next(err);
        doc.orderNumber = updatedCounter.seq;
        next();
    });
})

function validatePostalCode(postalCode){
    const postalCoderegex = new RegExp(/^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/);
    return postalCoderegex.test(postalCode)
}
module.exports =  mongoose.model('order', orderSchema);