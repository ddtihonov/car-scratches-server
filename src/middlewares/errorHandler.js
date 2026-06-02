// src/middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error('❌ Global Error:', err.message);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message,
        // В продакшене stack лучше не отправлять клиенту
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    };

// ⚠️ ЭТА СТРОКА ОБЯЗАТЕЛЬНА! Без неё модуль будет undefined
module.exports = errorHandler;