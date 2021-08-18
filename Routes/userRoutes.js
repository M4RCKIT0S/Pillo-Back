const express = require('express');
const userControllers = require('../Controllers/userControllers');
//Middleware que comprueba el nivel de autenticación del usuario.
const checkAuth = require('../Middlewares/checkAuth');

const router = express.Router(); 

//Registro de un usuario normal
router.post('/register', userControllers.register);
//Permite a un administrador crear una cuenta;
router.post('/createAccountAdmin', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, userControllers.register);
//Validación del email de un usuario
router.patch('/validateEmail', userControllers.validateUser);
//Login del usuario, se le entrega un token
router.post('/login', userControllers.login);
//Delete del usuario que esta logeado
router.delete('/deleteUser', checkAuth.checkLoggedIn, userControllers.deleteUser);
//Delete de un usuario que eliga el administrador
router.delete('/deleteUserAdmin', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, userControllers.deleteUserAdmin);
//Get del usuario logeado
router.get('/getUser', checkAuth.checkLoggedIn, userControllers.getUser);
//Get de todos los usuarios del sistema, solo puede ser ejecutado por un administrador logeado
router.get('/getAllUsers', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, userControllers.getAllUsers);
//Updatear los datos de un usuario excepto el tipo
router.patch('/updateUser', checkAuth.checkLoggedIn, userControllers.updateUser);
//Updatear el usuario para administrador, TODO se podría refactorizar con la funcion de updatear usuario y juntarlas en una única función.
router.patch('/updateUserAdmin', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, userControllers.updateUserAdmin);
module.exports = router;