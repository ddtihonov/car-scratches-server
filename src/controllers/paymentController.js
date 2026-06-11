 // Обработка HTTP запросов/ответов

const paymentService = require('../services/paymentService');

exports.createOrder = async (req, res, next) => {
    try {
        const result = await paymentService.createOrder(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
    };

    exports.getOrder = async (req, res, next) => {
    try {
        const result = await paymentService.getOrder(req.params.orderId);
        res.json(result);
    } catch (error) {
        next(error);
    }
    };

    exports.cancelOrder = async (req, res, next) => {
    try {
        const result = await paymentService.cancelOrder(req.params.orderId);
        res.json(result);
    } catch (error) {
        next(error);
    }
    };

    exports.createRefund = async (req, res, next) => {
    try {
        const result = await paymentService.createRefund(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
    };

    exports.getRefund = async (req, res, next) => {
    try {
        const result = await paymentService.getRefund(req.params.refundId);
        res.json(result);
    } catch (error) {
        next(error);
    }
    };

    exports.getToken = async (req, res, next) => {
    try {
        const result = await paymentService.getToken();
        res.json(result);
    } catch (error) {
        next(error);
    }
    };