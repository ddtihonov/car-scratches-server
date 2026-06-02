const paymentService = require('../services/paymentService');

exports.createOrder = async (req, res, next) => {
    try {
        const result = await paymentService.createOrder(req.body);
        res.status(201).json(result);
        // Если нужен редирект на фронтенде, фронтенд сам сделает это по полю payurl
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

    // Обработка Callback (Webhook) от Платежного шлюза
    exports.handleWebhook = async (req, res, next) => {
    try {
        // ⚠️ Здесь должна быть логика: 
        // 1. Проверка подписи (если шлюз её присылает)
        // 2. Обновление статуса заказа в вашей базе данных
        // 3. Логирование события
        
        console.log('📩 Получен webhook от шлюза:', req.body);
        
        // Всегда отвечайте 200 OK, чтобы шлюз не повторял запрос
        res.status(200).send('OK'); 
    } catch (error) {
        console.error('❌ Ошибка обработки webhook:', error);
        res.status(500).send('Internal Server Error');
    }
    };