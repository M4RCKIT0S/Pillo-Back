//Controllers
const shoppingChartControllers = require('../Controllers/shoppingChartControllers');

//Middlewares
const checkAuth = require('../Middlewares/checkAuth');

//Router
const router = require('./userRoutes');

//Crear un carrito de la compra
router.post('/createShoppingChart', checkAuth.checkLoggedIn, shoppingChartControllers.createShoppingChart);
//Eliminar un carrito de la compra
router.delete('/delete', checkAuth.checkLoggedIn, shoppingChartControllers.deleteSgoppingChart);
//Obtener el carrito
router.post('/get', checkAuth.checkLoggedIn, shoppingChartControllers.getShoppingChart);
//Eliminar todos los objetos de un carrito
router.patch('/removeProducts', checkAuth.checkLoggedIn, shoppingChartControllers.removeProducts);
//Añadir o  eliminar productos de un carrito
router.patch('/edit', checkAuth.checkLoggedIn, shoppingChartControllers.edit);
module.exports = router;