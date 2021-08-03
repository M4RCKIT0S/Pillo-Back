const express = require('express');
const userControllers = require('../Controllers/userControllers');

const router = express.Router(); 

//Registro de un usuario normal
router.post('/register', userControllers.register);
//Validación del email de un usuario
router.patch('/validateEmail', userControllers.validateUser);
//Login del usuario, se le entrega un token
router.post('/login', userControllers.login);

module.exports = router;