// src/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/orders', paymentController.createOrder);
router.get('/orders/:orderId', paymentController.getOrder);
router.post('/orders/:orderId/cancel', paymentController.cancelOrder);
router.post('/refunds', paymentController.createRefund);
router.get('/refunds/:refundId', paymentController.getRefund);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;