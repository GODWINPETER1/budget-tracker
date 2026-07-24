const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const recurringController = require('../controllers/recurringController');

router.use(authMiddleware);

router.get('/', recurringController.getAll);
router.post('/', recurringController.create);
router.post('/generate', recurringController.generate)
router.delete('/:id', recurringController.remove);

module.exports = router;