/**
 * Глобальный обработчик ошибок Express
 * @param {Error} err 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational ?? true;

    // Логируем ошибки
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        requestId: req.headers['x-request-id'],
    });

    // Отправляем ответ клиенту
    res.status(statusCode).json({
        success: false,
        error: {
        message: isOperational ? err.message : 'Внутренняя ошибка сервера',
        code: err.statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });

    // Для неоперационных ошибок — перезагружаем процесс
    if (!isOperational) {
        process.exit(1);
    }
};