
// Точка входа

const app = require('./src/app');
const config = require('./src/config');

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌍 Среда: ${config.isProduction ? 'PRODUCTION (SSL включен)' : 'DEVELOPMENT (SSL bypass включен)'}`);
    });