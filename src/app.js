// Сборка Express-приложения

const express = require('express');
const cors = require('cors');

const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Глобальные middleware
app.use(cors());
app.use(express.json());

// Подключение маршрутов
app.use('/api', paymentRoutes);

// Глобальный обработчик ошибок (всегда в конце!)
app.use(errorHandler);

module.exports = app;