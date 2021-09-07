const orderControllers = require('../Controllers/orderControllers');

const checkAuth = require('../Middlewares/checkAuth');

const router = require('./userRoutes');

//Crear un pedido
router.post('/createOrder', checkAuth.checkLoggedIn, orderControllers.createOrder);
//Obtener pedidos de un usuario logeado
router.post('/getUserOrders', checkAuth.checkLoggedIn, orderControllers.getOrdersUser);
//Obtener todos los pedidos
router.post('/getAllOrders', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, orderControllers.getAllOrders);
//Obtener un pedido en especifico
router.post('/getOrder', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, orderControllers.getOrder);
//Updatear el estado de un pedido, solo admins
router.patch('/updateProductState', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, orderControllers.editOrder);
//Eliminar un pedido por el admin
router.delete('/deleteOrder', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, orderControllers.deleteOrder);


module.exports = router;