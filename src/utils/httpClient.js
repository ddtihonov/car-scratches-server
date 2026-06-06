// Настроенный экземпляр Axios с токенами

// src/utils/httpClient.js

const axios = require('axios');
const https = require('https');
const config = require('../config');

let tokenCache = { token: null, expiresAt: 0 };

// 🔥 УМНАЯ ЛОГИКА SSL-ПРОВЕРКИ:
// - В production режиме обычно проверяем SSL
// - НО для тестового контура ВТБ (test3.api.vtb.ru) делаем исключение
//   через переменную VTB_SKIP_SSL_VERIFY=true
const shouldSkipSSL = process.env.VTB_SKIP_SSL_VERIFY === 'true' 
    || config.paymentGateway.baseUrl?.includes('test3.api.vtb.ru');

    console.log(`🔒 SSL проверка для ВТБ: ${shouldSkipSSL ? 'ВЫКЛЮЧЕНА (тестовый контур)' : 'ВКЛЮЧЕНА'}`);

    async function fetchNewToken() {
    console.log('🔑 Запрашиваем новый access_token...');

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', config.paymentGateway.clientId);
    params.append('client_secret', config.paymentGateway.clientSecret);

    const httpsAgent = new https.Agent({ 
        rejectUnauthorized: !shouldSkipSSL 
    });

    const response = await axios.post(
        config.paymentGateway.tokenUrl,
        params,
        {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        httpsAgent,
        timeout: 10000
        }
    );

    tokenCache = {
        token: response.data.access_token,
        expiresAt: Date.now() + (response.data.expires_in - 10) * 1000
    };

    console.log('✅ access_token получен, срок действия:', response.data.expires_in, 'сек.');
    return tokenCache.token;
    }

    async function getAuthToken() {
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now + 30000) {
        return tokenCache.token;
    }
    return await fetchNewToken();
    }

    const httpClient = axios.create({
    baseURL: config.paymentGateway.baseUrl,
    timeout: 15000,
    httpsAgent: new https.Agent({ rejectUnauthorized: !shouldSkipSSL })
    });

    httpClient.interceptors.request.use(async (requestConfig) => {
    const token = await getAuthToken();

    requestConfig.headers['Authorization'] = `Bearer ${token}`;

    if (config.paymentGateway.ibmClientId) {
        requestConfig.headers['X-IBM-Client-Id'] = config.paymentGateway.ibmClientId.toLowerCase();
    }

    if (config.paymentGateway.merchantAuthorization) {
        requestConfig.headers['Merchant-Authorization'] = config.paymentGateway.merchantAuthorization;
    }

    // Логирование для отладки
    const fullUrl = requestConfig.baseURL + requestConfig.url;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 ОТПРАВКА ЗАПРОСА В ШЛЮЗ:');
    console.log('   Полный URL:', fullUrl);
    console.log('   Метод:', requestConfig.method.toUpperCase());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return requestConfig;
    }, (error) => Promise.reject(error));

    httpClient.interceptors.response.use(
    (response) => {
        console.log('✅ Ответ от шлюза:', response.status);
        return response;
    },
    (error) => {
        if (error.response) {
        console.error('❌ Ошибка от шлюза:', error.response.status, JSON.stringify(error.response.data));
        } else {
        console.error('❌ Сетевая ошибка:', error.message);
        }
        return Promise.reject(error);
    }
    );

module.exports = httpClient;