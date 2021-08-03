const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port: 587,
    auth:{
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_SENDER_PASSWORD
    }
})

function sendVerificationEmail(email, userId){
    const token = jwt.sign({email, userId},process.env.token_userVerification,{expiresIn:'20m'});
    mail = {
        from: 'PilloApp',
        to: email,
        subject: 'Account verification',
        html:`<h1>Prueba</h1>
            <p>${token}</p>`
    }
    transporter.verify().then(console.log).catch(console.error);
    return new Promise((resolve, reject)=>{
        transporter.sendMail(mail, (err, messageInfo)=>{
            if(err){
                console.log(err);
                reject(err);
            }
            console.log(messageInfo);
            resolve(messageInfo);
        })
    })
}

module.exports = {
    sendVerificationEmail
}