const postalCodeControllers = require('../Controllers/postalCodeControllers');
//Middlewares
const checkAuth = require('../Middlewares/checkAuth');

const router = require('./userRoutes');

router.post('/createPostalCode', checkAuth.checkLoggedIn, checkAuth.checkIfAdmin, postalCodeControllers.createPostalCode);

module.exports = router;