const expres = require('express')
const userController = require('../controllers/userController')

const router = expres.Router()
router.get('/register', userController.register)
module.exports = router