const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');

const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const vtbProxyRoutes = require('./routes/vtbProxy');

const app = express();

// === Безопасность ===
app.use(helmet({
  contentSecurityPolicy: false, // Отключаем для API
}));

// === CORS ===
app.use(cors({
    origin: config.app.allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Correlation-ID'],
    exposedHeaders: ['X-Request-ID'],
}));

// === Парсинг тела запроса ===
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// === Логирование запросов ===
app.use((req, res, next) => {
  // Генерируем ID запроса, если не передан
    if (!req.headers['x-request-id']) {
        req.headers['x-request-id'] = uuidv4();
    }
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
        requestId: req.headers['x-request-id'],
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    
    next();
});

// === Health check ===
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
    });
});

// === API роуты ===
app.use('/api/vtb', vtbProxyRoutes);

// === 404 ===
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// === Глобальный обработчик ошибок ===
app.use(errorHandler);

// === Запуск сервера ===
const startServer = () => {
    app.listen(config.app.port, () => {
        console.log(`🚀 Server running on port ${config.app.port} (${config.app.nodeEnv})`);
        console.log(`📡 Health: http://localhost:${config.app.port}/health`);
    });
};

// Обработка незапланированных ошибок
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

startServer();