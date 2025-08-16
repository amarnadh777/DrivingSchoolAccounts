const expres = require('express')
const transactionController = require('../controllers/transactionController')

const router = expres.Router()

router.post('/', transactionController.createTransaction)


module.exports = router