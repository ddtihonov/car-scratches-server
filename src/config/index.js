require('dotenv').config();
const path = require('path');

module.exports = {
    app: {
        port: parseInt(process.env.PORT || '3001', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
        allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
    },

    vtb: {
        baseUrl: process.env.VTB_API_BASE || 'https://epa-ift-sbp.vtb.ru',
        tokenUrl: process.env.VTB_TOKEN_URL || '/passport/oauth2/token',
        paymentsUrl: process.env.VTB_PAYMENTS_URL || '/api/v1/sbp/payments',
        clientId: process.env.VTB_CLIENT_ID,
        clientSecret: process.env.VTB_CLIENT_SECRET,
        certPath: path.resolve(process.env.VTB_CERT_PATH || './certs/client.crt'),
        keyPath: path.resolve(process.env.VTB_KEY_PATH || './certs/client.key'),
        caPath: path.resolve(process.env.VTB_CA_PATH || './certs/ca.crt'),
    },

    security: {
        jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
        sessionTtl: parseInt(process.env.SESSION_TTL || '3600', 10),
    },
    };

// Валидация обязательных переменных
const requiredVars = [
    'VTB_CLIENT_ID',
    'VTB_CLIENT_SECRET',
    'VTB_CERT_PATH',
    'VTB_KEY_PATH',
];

requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`❌ Missing required env variable: ${varName}`);
    }
});

console.log(`✅ Config loaded: ${module.exports.app.nodeEnv.toUpperCase()} mode`);