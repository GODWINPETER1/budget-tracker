const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

router.use(authMiddleware);

router.get('/', transactionController.getAll);
router.post('/', transactionController.create);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.remove);

module.exports = router;