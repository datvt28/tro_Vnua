const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authenticateToken = require('../middleware/auth');

router.post('/vnpay/create', authenticateToken, PaymentController.createPayment);
router.put('/vnpay/callback', authenticateToken, PaymentController.callbackVnpay);

module.exports = router;
