const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware для проверки JWT-токена пользователя
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, config.security.jwtSecret);

        req.userId = decoded.userId;
        req.sessionId = decoded.sessionId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Неверный или истёкший токен' });
    }
};