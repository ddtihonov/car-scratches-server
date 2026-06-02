const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Глобальные middleware
app.use(cors());
app.use(express.json()); // Для обычных JSON запросов с фронтенда

// Подключение роутов
app.use('/api', paymentRoutes);

// Глобальная обработка ошибок (должна быть последней)
app.use(errorHandler);

module.exports = app;