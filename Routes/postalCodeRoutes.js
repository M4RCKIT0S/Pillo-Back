const postalCodeControllers = require('../Controllers/postalCodeControllers');
//Middlewares
const checkAuth = require('../Middlewares/checkAuth');

const router = require('./userRoutes');

//Para crear un codigo postañ
router.post('/createPostalCode', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, postalCodeControllers.createPostalCode);
//Para obtener un codigo postal
router.get('/getPostalCode', postalCodeControllers.getPostalCode);
//Para obtener todos los codigos postales
router.get('/getAllPostalCodes', postalCodeControllers.getAllPostalCodes);
//Para eliminar un codigo postal
router.delete('/deletePostalCode', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, postalCodeControllers.deletePostalCode);

module.exports = router;