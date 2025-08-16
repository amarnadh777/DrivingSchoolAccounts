const expres = require('express')
const transactionController = require('../controllers/transactionController')

const router = expres.Router()

router.post('/', transactionController.createTransaction)
router.get('/categories', transactionController.getCategories)



module.exports = router