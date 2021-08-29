const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    number:{
        type: Number,
        required: true
    },
    status: {
        type: String,
        default:'Confirmed',
        enum:['Confirmed']
    },
    name:{
        type: String
    },
    phone:{
        type: Number,
        required: true,
    },
    products:{
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'product'
    },
    shops:{
        type:Number,
    },
    paymentMethod:{
        type: String,
        default: 'Efectivo',
        enum:['Efectivo']
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