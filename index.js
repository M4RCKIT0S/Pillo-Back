const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

//Port on which the app is hosted
const port = process.env.PORT || 4000;
// Database url, actually mongodb
const dbUrl = process.env.dbUrl || '';

mongoose.connect(dbUrl,{ useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify: false, useCreateIndex: true},(err)=>{
    if(err) console.log('Error connecting to db');
    app.listen(port, ()=>{
        console.log(`Api succesfully started on port:${port}`);
    });
    console.log('Succesfully connected to db');
})

app.get('/',(req,res)=>{
    res.send('Esto funciona');
});