//Controllers
const shoppingCartControllers = require('../Controllers/shoppingCartControllers');

//Middlewares
const checkAuth = require('../Middlewares/checkAuth');

//Router
const router = require('./userRoutes');

//Crear un carrito de la compra
router.post('/createShoppingCart', checkAuth.checkLoggedIn, shoppingCartControllers.createShoppingCart);
//Eliminar un carrito de la compra
router.delete('/deleteShoppingCart', checkAuth.checkLoggedIn, shoppingCartControllers.deleteShoppingCart);
//Obtener el carrito
router.post('/getShoppingCart', checkAuth.checkLoggedIn, shoppingCartControllers.getShoppingCart);
//Eliminar todos los objetos de un carrito
router.patch('/removeProducts', checkAuth.checkLoggedIn, shoppingCartControllers.removeProducts);
//Añadir o  eliminar productos de un carrito
router.patch('/editShoppingCart', checkAuth.checkLoggedIn, shoppingCartControllers.edit);
module.exports = router;