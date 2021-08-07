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
async function getPostalCode(req, res){
    try{
        const code = req.body.postalCode;
        const postalCodedb = await postalCode.findOne({code});
        if(!postalCodedb) return res.status(404).send({message:'Postal code not found. Invalid postal code.', success: false, date:Date()});
        return res.status(200).send({message:'Postal code found successfully. This postal code is Valid.', postalCode: postalCodedb, success: true, date:Date()});
    }catch(error){
        return res.status(500).send({message:'Internal server error.', success:false, date:Date()});
    }
}
async function getAllPostalCodes(req, res){
    try{
        const codes = await postalCode.find({});
        if(!codes) return res.status(404).send({message:'There are no postal codes.', success: true, date:Date()});
        return res.status(200).send({message:'Postal codes found successfully.', postalCodes: codes, success: true, date:Date()});
    }catch(error){
        return res.status(500).send({message:'Internal server error.', success:false, date:Date()});
    }
}
function deletePostalCode(req, res){
    const code = req.body.postalCode;
    postalCode.findOneAndDelete({code},(err, codeDeleted)=>{
        if(err) return res.status(500).send({message:'Internal server error.', success:false, date:Date()});
        if(!codeDeleted) return res.status(404).send({message:'Postal code not found.', success: false, date:Date()});
        return res.status(200).send({message:'Postal code deleted successfully.', codeDeleted, success: true, date:Date()});
    })
}
module.exports = {
    createPostalCode,
    getPostalCode,
    getAllPostalCodes,
    deletePostalCode
}