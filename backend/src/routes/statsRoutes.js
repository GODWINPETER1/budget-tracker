const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const statsController = require('../controllers/statsController');

router.use(authMiddleware);
router.get('/dashboard', statsController.getDashboard);

module.exports = router;