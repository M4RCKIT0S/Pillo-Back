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
router.get('/get', checkAuth.checkLoggedIn, shoppingChartControllers.getShoppingChart);
//Añadir, eliminar uno o todos los productos de un carrito
//router.patch('/edit', checkAuth.checkLoggedIn, shoppingChartControllers.editShoppingChart);
module.exports = router;