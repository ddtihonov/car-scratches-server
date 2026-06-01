const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const vtbAuthService = require('../services/vtbAuthService');
const authenticateUser = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

// Создаём клиент для проксирования
const vtbClient = axios.create({
    baseURL: config.vtb.baseUrl,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
    },
    });

    /**
     * POST /api/vtb/sbp/pay
     * Создание платежа через СБП
     */
    router.post('/sbp/pay', authenticateUser, async (req, res) => {
    const requestId = req.headers['x-request-id'] || uuidv4();
    
    try {
        // 1. Получаем токен ВТБ
        const vtbToken = await vtbAuthService.getToken();

        // 2. Формируем запрос к ВТБ
        const vtbResponse = await vtbClient.post(
        config.vtb.paymentsUrl,
        {
            ...req.body,
            merchantId: config.vtb.clientId,
            externalOrderId: req.body.orderId,
        },
        {
            headers: {
            'Authorization': `Bearer ${vtbToken}`,
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
            'X-Correlation-ID': req.sessionId,
            'X-Timestamp': new Date().toISOString(),
            },
        }
        );

        // 3. Возвращаем ответ клиенту (очищаем чувствительные данные)
        const { access_token, refresh_token, ...safeData } = vtbResponse.data;
        
        res.json({
        success: true,
        requestId,
        data: safeData,
        });

    } catch (error) {
        console.error(`[VTB Proxy] Error: ${error.message}`, {
        requestId,
        status: error.response?.status,
        vtbError: error.response?.data,
        });

        const statusCode = error.response?.status || 502;
        const vtbError = error.response?.data;

        res.status(statusCode).json({
        success: false,
        error: {
            message: vtbError?.error_description || 'Ошибка обработки платежа',
            code: vtbError?.error || 'VTB_PROXY_ERROR',
            requestId,
        },
        });
    }
    });

    /**
     * GET /api/vtb/sbp/status/:paymentId
     * Проверка статуса платежа
     */
    router.get('/sbp/status/:paymentId', authenticateUser, async (req, res) => {
    const { paymentId } = req.params;
    const requestId = uuidv4();

    try {
        const vtbToken = await vtbAuthService.getToken();

        const response = await vtbClient.get(
        `${config.vtb.paymentsUrl}/${paymentId}`,
        {
            headers: {
            'Authorization': `Bearer ${vtbToken}`,
            'X-Request-ID': requestId,
            'X-Correlation-ID': req.sessionId,
            },
        }
        );

        res.json({
        success: true,
        data: response.data,
        });

    } catch (error) {
        console.error(`[VTB Status] Error: ${error.message}`);
        res.status(error.response?.status || 502).json({
        success: false,
        error: { message: 'Не удалось получить статус платежа' },
        });
    }
    });

    /**
     * POST /api/vtb/token/refresh
     * Принудительное обновление токена (для админ-панели)
     */
    router.post('/token/refresh', async (req, res) => {
    try {
        const newToken = await vtbAuthService.refreshToken();
        res.json({ success: true, message: 'Токен обновлён' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;