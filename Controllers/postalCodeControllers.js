const postalCode = require('../Models/postalCode');

function createPostalCode(req, res){
    const code = req.body.postalCode;
    const codeModel = new postalCode({
        code
    })
    codeModel.save((errorSaving, postalCodeSaved)=>{
        if(errorSaving) return res.status(500).send({message:'Error saving postal code.', errorSaving,success: true, date: Date()});
        return res.status(200).send({message:'Postal code saved successfully.',postalCodeSaved, success:true, date:Date()});
    });
}
module.exports = {
    createPostalCode
}