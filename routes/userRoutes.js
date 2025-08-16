const expres = require('express')
const userController = require('../controllers/userController')

const router = expres.Router()
router.post('/register', userController.register)
router.post('/login', userController.login)

module.exports = router