const User = require('../Models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


dotenv.config();

//Services
const emailServices = require('../Services/email');

/**
 * @param {*} req 
 * @param {*} res 
 * Registro para usuario normal, en el momento que se registra se envia el email de validación.
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
                adress: req.body.adress,
                city: req.body.city,
                postalCode: req.body.postalCode
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
/**
 * @param {*} req 
 * @param {*} res 
 * Esta funcion sirve para validar un usario y que este pase a ser un usuario verificado. A partir de ahora tiene acceso a la aplicación
 */
function validateUser(req, res){
    const {token} = req.query;
    console.log(token);
    jwt.verify(token,process.env.token_userVerification,(err, decoded)=>{
        if(err) return res.status(400).send({message:'Invalid token. Please ask for a new token.', error:err, success: false, date: Date()});
        User.findByIdAndUpdate(decoded.userId, {$set:{userType: 'basicUserVerified'}},{new: true},(error, userUpdated)=>{
            if(error) return res.status(404).send({message:'No user found. Get in contact with us.', success: false, date: Date()});
            return res.status(200).send({message:'User verified succesfully.', userUpdated, success: true, date: Date()});
        });
    });
}
function login(req, res){
    const {email} = req.body;
    const {password} = req.body;
    User.findOne({email},(err, user)=>{
        if(err || !user) return res.status(404).send({message:'This email is not associated to any account.', success:false, date:Date()});
        if(user.userType === "basicUserVerified" ||
            user.userType === "admin" ||
            user.userType === "shopAdmin"){
                bcrypt.compare(password, user.password, (error, result)=>{
                    if(error || !result) return res.status(400).send({message: 'Email or password invalid. Please try again.', success: false, error, date: Date()});
                    const token = jwt.sign({id: user._id, email, userType: user.userType}, process.env.token_login ,{expiresIn: '2h'});
                    return res.status(200).send({message:'Logged in successfully.',token,expiresIn: '2h', success: true, date: Date()});
                });
            } else{
                return res.status(400).send({message: 'User is not verified. Please verify your email and try again.', success: false, date: Date()});
            }
    });
}
/**
 * Permite a un usuario eliminar su cuenta
 * @param {*} req 
 * @param {*} res 
 */
function deleteUser(req, res){
    const {id} = req.userData;
    User.findOneAndDelete({_id: id},(err, userDeleted)=>{
        if(err || !userDeleted) return res.status(400).send({message:'Couldn`t find user.', success: false, date: Date()});
        return res.status(200).send({message:'User deleted successfully.', userDeleted, success: true, date:Date()});
    });
}
module.exports = {
    register,
    validateUser,
    login,
    deleteUser
}