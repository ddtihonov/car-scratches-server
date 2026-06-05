// Сборка Express-приложения

// backend/src/app.js

const express = require('express');
const cors = require('cors');
const config = require('./config');

const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 🔥 Доверяем nginx (reverse proxy на VPS Beget)
// Это нужно, чтобы Express правильно определял:
// - реальный протокол (https/http) клиента
// - реальный IP-адрес клиента
// - хост запроса
app.set('trust proxy', true);

// ==========================================
// НАСТРОЙКА CORS
// ==========================================
// Кросс-доменная архитектура:
// - Frontend: https://guru-mos.ru
// - Backend:  https://api.tihonov-studio.ru
const corsOptions = {
    origin: function (origin, callback) {
        // 1. Разрешаем запросы без заголовка Origin
        //    (webhook от ВТБ, Postman, curl, мобильные приложения)
        if (!origin) {
        return callback(null, true);
        }

        // 2. Проверяем, есть ли домен в белом списке
        if (config.allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
        } else {
        // 3. Блокируем запросы с неизвестных доменов
        console.warn(`❌ CORS: заблокирован запрос с домена ${origin}`);
        callback(new Error(`Not allowed by CORS. Domain: ${origin}`));
        }
    },
    
    // Разрешённые HTTP-методы
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    
    // 🔥 Разрешённые заголовки от фронтенда
    // X-IBM-Client-Id и Merchant-Authorization НЕ нужны здесь —
    // их backend добавляет автоматически при запросе к ВТБ
    allowedHeaders: [
        'Content-Type',
        'Authorization'
    ],
    
    // Разрешаем передачу cookies (если понадобится в будущем)
    credentials: true,
    
    // Время кэширования preflight-запроса (в секундах)
    // Браузер будет кэшировать результат OPTIONS-запроса 1 час
    maxAge: 3600
    };

    // Применяем CORS ко всем маршрутам
    app.use(cors(corsOptions));

    // Парсер JSON для тела запросов
    app.use(express.json());

    // Парсер URL-encoded данных (на случай, если понадобится)
    app.use(express.urlencoded({ extended: true }));

    // ==========================================
    // МАРШРУТЫ (ROUTES)
    // ==========================================

    // Health check — для проверки работоспособности сервера
    app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: config.env,
        uptime: process.uptime(),
        api: config.paymentGateway.baseUrl
    });
    });

    // Подключаем маршруты API платежей
    // Все маршруты из paymentRoutes будут доступны по префиксу /api
    app.use('/api', paymentRoutes);

    // ==========================================
    // ОБРАБОТЧИК 404 (не найдено)
    // ==========================================
    app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.originalUrl}`
    });
    });

    // ==========================================
    // ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК
    // ==========================================
    // ⚠️ ВАЖНО: должен быть ПОСЛЕДНИМ middleware!
    app.use(errorHandler);

module.exports = app;