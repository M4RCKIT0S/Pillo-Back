const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    number:{
        type: Number,
        required: true
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
        product:{
            type: [mongoose.SchemaTypes.ObjectId],
            ref: 'product'
        },
        quantity: Number,
        variant: mongoose.SchemaTypes.Mixed
    }],
    shops:{
        type:Number,
    },
    paymentMethod:{
        type: String,
        default: 'Efectivo',
        enum:['Efectivo', 'Bizum']
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
})
orderSchema.pre('save', function(next){
    var doc = this;
    Order.findByIdAndUpdate(doc._id,{$inc:{number:1}},{new: true} ,(err, order)=>{
        if(err) return next(err);
        next();
    });
})
const Order = mongoose.model('order', orderSchema);
function validatePostalCode(postalCode){
    return postalCode.match(/^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/)
}
mongoose.exports = Order;