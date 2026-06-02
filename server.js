const app = require('./src/app');
const config = require('./src/config');

const PORT = config.port || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌍 Среда: ${config.isProduction ? 'PRODUCTION' : 'TEST (SSL bypass enabled)'}`);
    });