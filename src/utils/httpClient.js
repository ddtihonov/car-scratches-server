// src/utils/httpClient.js

const axios = require('axios');
const https = require('https');

// Кэш для хранения токена и времени его истечения
let tokenCache = { token: null, expiresAt: 0 };

/**
 * Получает новый access_token от Платежного шлюза
 */
async function fetchNewToken() {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', process.env.PAYMENT_GATEWAY_CLIENT_ID);
    params.append('client_secret', process.env.PAYMENT_GATEWAY_CLIENT_SECRET);

    // Агент для игнорирования ошибки SSL в тестовой среде
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    const response = await axios.post(
        process.env.PAYMENT_GATEWAY_TOKEN_URL,
        params,
        {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        httpsAgent,
        timeout: 10000
        }
    );

    // Сохраняем токен в кэш (с запасом 10 секунд до реального истечения)
    tokenCache = {
        token: response.data.access_token,
        expiresAt: Date.now() + (response.data.expires_in - 10) * 1000
    };

    return tokenCache.token;
    }

    /**
     * Возвращает валидный токен (из кэша или новый)
     */
    async function getAuthToken() {
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now + 30000) {
        return tokenCache.token;
    }
    return await fetchNewToken();
    }

    // Создаем экземпляр axios с базовыми настройками
    const httpClient = axios.create({
    baseURL: process.env.PAYMENT_GATEWAY_BASE_URL,
    timeout: 10000,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Важно для тестовой среды ВТБ
    });

    // Перехватчик (interceptor): выполняется перед КАЖДЫМ запросом к шлюзу
    httpClient.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
    
    // Автоматически добавляем заголовки
    config.headers['Authorization'] = `Bearer ${token}`;
    
    if (process.env.IBM_CLIENT_ID) {
        config.headers['X-IBM-Client-Id'] = process.env.IBM_CLIENT_ID.toLowerCase();
    }
    
    if (process.env.MERCHANT_AUTHORIZATION) {
        config.headers['Merchant-Authorization'] = process.env.MERCHANT_AUTHORIZATION;
    }

    return config;
    }, (error) => {
    return Promise.reject(error);
    });

// ⚠️ ОБЯЗАТЕЛЬНЫЙ ЭКСПОРТ самого экземпляра axios (у него есть методы .get, .post, .put и т.д.)
module.exports = httpClient;