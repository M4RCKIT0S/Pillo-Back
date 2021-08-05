const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type: String,
        validate:[validateNormalString, 'Please fill a valid name.']
    },
    surname:{
        type: String,
        validate: [validateNormalString, 'Please fill a valid surname.']
    },
    email:{
        type: String,
        required: true,
        validate: [validateEmail, 'Please fill a valid email.'],
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    userType:{
        type: String,
        enum: ['basicUserVerified','basicUserNotVerified', 'admin', 'shopAdmin'],
        default: 'basicUserNotVerified'
    },
    phoneNumber:{
        type: Number,
        required: true,
    },
    adress:{
        street: String,
        city: String,
        postalCode:{
            type: String,
            validate: [validatePostalCode, "Please fill a valid postal code."]
        }
    },
},{
    timestamps: true,
});

function validateNormalString(string){
    const regex =  new RegExp(/^([A-Za-z0-9]){3,20}$/m);
    return regex.test(string);
}

function validateEmail(email){
    var emailRegex = /[a-z0-9!#$%&'+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'+/=?^_`{|}~-]+)@(?:[a-z0-9](?:[a-z0-9-][a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/m;
    return emailRegex.test(email);
}
function validatePostalCode(postalCode){
    return postalCode.match(/^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/)
}

module.exports = mongoose.model('User', userSchema);