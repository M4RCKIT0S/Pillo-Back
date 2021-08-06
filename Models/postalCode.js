const mongoose = require('mongoose');

const postalCode = mongoose.Schema({
    code: {
        type: String,
        required: true,
        validate: [validatePostalCode, 'Please fill a valid postal code for Spain.'],
    }
});
function validatePostalCode(postalCode){
    return postalCode.match(/^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/)
}

module.exports = mongoose.model('postalCode', postalCode);