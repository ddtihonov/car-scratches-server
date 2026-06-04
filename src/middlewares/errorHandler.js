// Глобальный обработчик ошибок
// backend/src/middlewares/errorHandler.js

const config = require('../config');

const errorHandler = (err, req, res, next) => {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Global Error:', err.message);
    
    // 🔥 Логируем детали ответа от ВТБ
    if (err.response) {
        console.error('📥 Ответ от шлюза:');
        console.error('   Статус:', err.response.status);
        console.error('   Заголовки:', err.response.headers);
        console.error('   Тело ответа:', JSON.stringify(err.response.data, null, 2));
    }
    
    if (err.config) {
        console.error('📤 Запрос, который вызвал ошибку:');
        console.error('   URL:', err.config.url);
        console.error('   Метод:', err.config.method?.toUpperCase());
        console.error('   Тело запроса:', JSON.stringify(err.config.data, null, 2));
    }
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const statusCode = err.response?.status || err.statusCode || 500;
    
    // 🔥 Извлекаем детальное сообщение об ошибке от ВТБ
    const vtbError = err.response?.data;
    const message = 
        vtbError?.description ||
        vtbError?.message ||
        vtbError?.error ||
        (vtbError?.errors ? vtbError.errors.map(e => e.message).join(', ') : null) ||
        err.message ||
        'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message,
        details: vtbError,
        stack: config.env === 'development' ? err.stack : undefined
    });
    };

module.exports = errorHandler;