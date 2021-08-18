//Controllers
const categoryControllers = require('../Controllers/categoryController');
const subcategoryControllers = require('../Controllers/subcategoryController');

//Middlewares
const checkAuth = require('../Middlewares/checkAuth');

//Router
const router = require('./userRoutes');

//Categorías
//Para crear categoría
router.post('/createCategory', checkAuth.checkLoggedIn,checkAuth.checkIfAdmin, categoryControllers.createCategory);
//Para obtener las categorías
router.get('/getCategories', checkAuth.checkLoggedIn, categoryControllers.getCategories);
//Obtener una categoría en específico
router.get('/getCategory', checkAuth.checkLoggedIn, categoryControllers.getCategory);
//Eliminar una categoría y sus subcategorías
router.delete('/deleteCategory/:id', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, categoryControllers.deleteCategory);




//Subcategorías
//Para crear subcategoria
router.post('/createSubcategory', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, subcategoryControllers.createSubcategory);
//Obtener todas las subcategorías
router.get('/getSubcategories', checkAuth.checkLoggedIn, subcategoryControllers.getAllSubcategories);

module.exports = router;