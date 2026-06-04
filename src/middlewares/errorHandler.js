// Глобальный обработчик ошибок
const config = require('../config');

const errorHandler = (err, req, res, next) => {
    console.error('❌ Global Error:', err.message);

    const statusCode = err.response?.status || err.statusCode || 500;
    const message = err.response?.data?.description || err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message,
        stack: config.env === 'development' ? err.stack : undefined
    });
    };

// ⚠️ ВАЖНО: Экспорт функции
module.exports = errorHandler;