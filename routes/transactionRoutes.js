const expres = require('express')
const transactionController = require('../controllers/transactionController')
const upload = require("../middlewares/upload")
const router = expres.Router()

router.post('/', upload.single("receiptImage"),transactionController.createTransaction)
router.get('/categories', transactionController.getCategories)
router.post('/categories', transactionController.createCategory)




module.exports = router