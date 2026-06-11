// Настроенный экземпляр Axios с разделённой логикой
// src/utils/httpClient.js

const axios = require('axios');
const https = require('https');
const config = require('../config');

let tokenCache = { token: null, expiresAt: 0 };

const shouldSkipSSL = process.env.VTB_SKIP_SSL_VERIFY === 'true' 
    || config.paymentGateway.baseUrl?.includes('test3.api.vtb.ru');

console.log(`🔒 SSL проверка для ВТБ: ${shouldSkipSSL ? 'ВЫКЛЮЧЕНА' : 'ВКЛЮЧЕНА'}`);

// 🔥 1. АГЕНТ ДЛЯ ПОЛУЧЕНИЯ ТОКЕНА (максимальная совместимость)
const tokenHttpsAgent = new https.Agent({ 
    rejectUnauthorized: !shouldSkipSSL,
    family: 4, // 🔥 Принудительно используем IPv4 (решает 90% проблем "curl работает, node нет")
    keepAlive: false // Отключаем keep-alive для токена
});

// 🔥 2. АГЕНТ ДЛЯ API ЗАПРОСОВ (ордера, возвраты)
const apiHttpsAgent = new https.Agent({ 
    rejectUnauthorized: !shouldSkipSSL,
    family: 4, // 🔥 Принудительно IPv4
    keepAlive: true
});

// 🔥 3. ФУНКЦИЯ ПОЛУЧЕНИЯ ТОКЕНА (изолированная)
async function fetchNewToken() {
    console.log('🔑 Запрашиваем новый access_token...');

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', config.paymentGateway.clientId);
    params.append('client_secret', config.paymentGateway.clientSecret);

    try {
        const response = await axios.post(
            config.paymentGateway.tokenUrl,
            params,
            {
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'curl/7.68.0' // Имитируем curl, который точно работает
                },
                httpsAgent: tokenHttpsAgent,
                timeout: 10000
            }
        );

        tokenCache = {
            token: response.data.access_token,
            expiresAt: Date.now() + (response.data.expires_in - 10) * 1000
        };

        console.log('✅ access_token получен, срок действия:', response.data.expires_in, 'сек.');
        return tokenCache.token;
    } catch (error) {
        console.error('❌ Ошибка при получении токена:', error.message);
        throw error;
    }
}

async function getAuthToken() {
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now + 30000) {
        return tokenCache.token;
    }
    return await fetchNewToken();
}

// 🔥 4. КЛИЕНТ ДЛЯ API ЗАПРОСОВ (создание ордеров и т.д.)
const httpClient = axios.create({
    baseURL: config.paymentGateway.baseUrl,
    timeout: 15000,
    httpsAgent: apiHttpsAgent,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
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

    const fullUrl = requestConfig.baseURL + requestConfig.url;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 ОТПРАВКА ЗАПРОСА В ШЛЮЗ (API):');
    console.log('   Полный URL:', fullUrl);
    console.log('   Метод:', requestConfig.method.toUpperCase());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return requestConfig;
}, (error) => Promise.reject(error));

httpClient.interceptors.response.use(
    (response) => {
        console.log('✅ Ответ от шлюза (API):', response.status);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('❌ Ошибка от шлюза (API):', error.response.status, JSON.stringify(error.response.data));
        } else {
            console.error('❌ Сетевая ошибка (API):', error.message);
        }
        return Promise.reject(error);
    }
);

module.exports = httpClient;
module.exports.getAuthToken = getAuthToken;