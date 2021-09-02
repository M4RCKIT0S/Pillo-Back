//Controllers
const productControllers = require('../Controllers/productControllers');
const multer  = require('multer')
const upload = multer()
//Middlewares
const checkAuth = require('../Middlewares/checkAuth');

//Router
const router = require('./userRoutes');

//Crear un producto
router.post('/createProduct',   checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, productControllers.createProduct);
//Obtener los productos
router.get('/getProducts',  productControllers.getProducts);
//Obtener un producto en concreto
router.post('/getProduct',   productControllers.getProduct);
//Eliminar un producto
router.delete('/deleteProduct', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, productControllers.deleteProduct);
//Editar un producto, por ahora los extra fields no se pueden editar en detalle, solo añadir nuevos o borrar los ya existentes
router.patch('/updateProduct', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, productControllers.updateProduct);
//Updatear las fotos de un producto
router.patch('/updateImages', upload.any('files'), checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, productControllers.updateImages);
//Obtener objetos de una categoría
router.post('/getProductsByCategory', productControllers.getProductsByCategory);
//Obtener objetos de una subcategoria
router.post('/getProductsBySubCategory', productControllers.getProductsBySubCategory);

module.exports = router;