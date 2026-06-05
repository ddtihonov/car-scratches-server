
// Точка входа
const app = require('./src/app');
const config = require('./src/config');

const PORT = process.env.PORT || config.port || 3000;

// Доверяем nginx (reverse proxy)
app.set('trust proxy', true);

// Слушаем на 127.0.0.1 — доступ только через nginx
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌍 Среда: ${process.env.NODE_ENV}`);
  console.log(`🔗 API: ${config.paymentGateway.baseUrl}`);
  console.log(`🔗 Return URL: ${config.public.return_url}`);
});
