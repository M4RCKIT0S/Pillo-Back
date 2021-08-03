const User = require('../Models/user');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const user = require('../Models/user');

//Services
const emailServices = require('../Services/email');

/**
 * @param {*} req 
 * @param {*} res 
 * Registro para usuario normal, en el momento que se registra se envia el email de validación(todo).
 */
function register(req, res){
    const saltRounds = process.env.SALT_ROUNDS;
    const { password } = req.body;
    bcrypt.genSalt(parseInt(saltRounds) ,(err, salt)=>{
        if(err){
            return res.status(500).send({message:'Internal server error.',error:'Error creating salt'+err, success: false, date: Date()});

        }
        bcrypt.hash(password,salt,(error, passwordHashed)=>{
            if(error) return res.status(500).send({message:'Internal server error', error:'Error hashing password'+error, success: false, date: Date()});
            const user = new User({
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                password: passwordHashed,
                phoneNumber: req.body.phoneNumber, 
                adress: req.body.adress
            });
            user.save((errorSavingUser, userSaved)=>{
                if(errorSavingUser) return res.status(400).send({message:'Error saving user, please try again.',error:errorSavingUser ,success: false, date: Date()});
                try{
                    emailServices.sendVerificationEmail(userSaved.email, userSaved._id);
                }catch(error){
                    return res.status(599).send({message:'Error sending email.',error: error, success:false });
                }
                return res.status(200).send({message:'User saved succesfully', user: userSaved});
            });
        });
    });
};

module.exports = {
    register
}