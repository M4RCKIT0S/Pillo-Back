//Controllers
const shopController = require('../Controllers/shopController');

//Middlewares
const checkAuth = require('../Middlewares/checkAuth');

//Router
const router = require('./userRoutes');

//Tienda

//Para crear tienda
router.post('/createShop', checkAuth.checkLoggedIn,checkAuth.checkIfAdmin, shopController.createShop);
//Para obtener tiendas
router.get('/getShops', checkAuth.checkLoggedIn, shopController.getAllShops);
//Obtener una tienda
router.get('/getShop', checkAuth.checkLoggedIn, shopController.getShop);
//Eliminar una tienda
router.delete('/deleteShop', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, shopController.deleteShop);
//Updatear una tienda
router.patch('/updateShop', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, shopController.updateShop);


module.exports = router;