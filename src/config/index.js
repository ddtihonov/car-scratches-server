// Конфигурация и валидация переменных

// backend/src/config/index.js

require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'],

  paymentGateway: {
    baseUrl: process.env.PAYMENT_GATEWAY_BASE_URL,
    tokenUrl: process.env.PAYMENT_GATEWAY_TOKEN_URL,
    clientId: process.env.PAYMENT_GATEWAY_CLIENT_ID,
    clientSecret: process.env.PAYMENT_GATEWAY_CLIENT_SECRET,
    ibmClientId: process.env.IBM_CLIENT_ID,
    merchantAuthorization: process.env.MERCHANT_AUTHORIZATION,
  },

  // 🔥 Публичные URL
  public: {
    return_url: process.env.PUBLIC_RETURN_URL,
    error_url: process.env.PUBLIC_ERROR_URL,
  }
};

// Валидация критически важных переменных
const requiredVars = [
  'PAYMENT_GATEWAY_BASE_URL',
  'PAYMENT_GATEWAY_TOKEN_URL',
  'PAYMENT_GATEWAY_CLIENT_ID',
  'PAYMENT_GATEWAY_CLIENT_SECRET',
  'IBM_CLIENT_ID'
];

for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error(`❌ FATAL ERROR: Переменная окружения ${key} не найдена в .env`);
    process.exit(1);
  }
}

// 🔥 В production обязательно проверяем наличие публичных URL
if (config.isProduction) {
  if (!config.public.return_url) {
    console.error('❌ FATAL ERROR: В production обязательно укажите PUBLIC_RETURN_URL');
    process.exit(1);
  }
}

console.log('⚙️  Конфигурация загружена:');
console.log('   Среда:', config.env);
console.log('   Порт:', config.port);
console.log('   API URL:', config.paymentGateway.baseUrl);
console.log('   Return URL:', config.public.return_url);
console.log('   Разрешённые домены:', config.allowedOrigins.join(', '));

module.exports = config;