// src/config/index.js

// Убедимся, что переменные из .env загружены
require('dotenv').config();

const config = {
    // Основные настройки сервера
    port: parseInt(process.env.PORT, 10) || 3001,
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',

    // Настройки Платежного шлюза
    paymentGateway: {
        baseUrl: process.env.PAYMENT_GATEWAY_BASE_URL,
        tokenUrl: process.env.PAYMENT_GATEWAY_TOKEN_URL,
        clientId: process.env.PAYMENT_GATEWAY_CLIENT_ID,
        clientSecret: process.env.PAYMENT_GATEWAY_CLIENT_SECRET,
        ibmClientId: process.env.IBM_CLIENT_ID,
        merchantAuthorization: process.env.MERCHANT_AUTHORIZATION,
    }
    };

    // ==========================================
    // ВАЛИДАЦИЯ (Fail Fast)
    // Если критически важных переменных нет, сервер не запустится
    // ==========================================
    const requiredVars = [
    'PAYMENT_GATEWAY_BASE_URL',
    'PAYMENT_GATEWAY_TOKEN_URL',
    'PAYMENT_GATEWAY_CLIENT_ID',
    'PAYMENT_GATEWAY_CLIENT_SECRET',
    'IBM_CLIENT_ID'
    ];

    for (const key of requiredVars) {
    if (!process.env[key]) {
        console.error(`❌ FATAL ERROR: Переменная окружения ${key} не найдена в файле .env`);
        process.exit(1); // Принудительно останавливаем запуск
    }
    }

module.exports = config;