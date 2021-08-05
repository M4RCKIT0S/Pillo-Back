const express = require('express');
const userControllers = require('../Controllers/userControllers');
//Middleware que comprueba el nivel de autenticación del usuario.
const checkAuth = require('../Middlewares/checkAuth');

const router = express.Router(); 

//Registro de un usuario normal
router.post('/register', userControllers.register);
//Validación del email de un usuario
router.patch('/validateEmail', userControllers.validateUser);
//Login del usuario, se le entrega un token
router.post('/login', userControllers.login);
//Delete del usuario que esta logeado
router.delete('/deleteUser', checkAuth.checkLoggedIn, userControllers.deleteUser);
//Get del usuario logeado
router.get('/getUser', checkAuth.checkLoggedIn, userControllers.getUser);

module.exports = router;