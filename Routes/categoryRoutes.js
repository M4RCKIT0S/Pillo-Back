//Controllers
const categoryControllers = require('../Controllers/categoryController');

//Middlewares
const checkAuth = require('../Middlewares/checkAuth');

//Router
const router = require('./userRoutes');

router.post('/createCategory', checkAuth.checkLoggedIn,checkAuth.checkIfAdmin, categoryControllers.createCategory);

module.exports = router;