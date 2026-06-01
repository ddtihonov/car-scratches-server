const axios = require('axios');
const https = require('https');
const fs = require('fs');
const qs = require('qs');
const config = require('../config');

/**
 * @typedef {Object} VtbTokenResponse
 * @property {string} access_token
 * @property {'Bearer'} token_type
 * @property {number} expires_in
 * @property {string} scope
 */

class VtbAuthService {
    constructor() {
        this.token = null;
        this.tokenExpiresAt = 0;
        this.BUFFER_SECONDS = 30; // Обновлять за 30 сек до истечения
    }

    /**
     * Создаём HTTPS-агент с mTLS
     * @returns {https.Agent}
     */
    createHttpsAgent() {
        return new https.Agent({
        cert: fs.readFileSync(config.vtb.certPath),
        key: fs.readFileSync(config.vtb.keyPath),
        ca: fs.readFileSync(config.vtb.caPath),
        rejectUnauthorized: true, // ВТБ требует строгую валидацию
        });
    }

    /**
     * Создаём axios-инстанс для ВТБ
     * @returns {import('axios').AxiosInstance}
     */
    createVtbClient() {
        return axios.create({
        baseURL: config.vtb.baseUrl,
        httpsAgent: this.createHttpsAgent(),
        timeout: 15000,
        headers: {
            'Accept': 'application/json',
        },
        });
    }

    /**
     * Получает access_token от ВТБ (с кэшированием)
     * @returns {Promise<string>}
     */
    async getToken() {
        // Возвращаем кэшированный токен, если он ещё валиден
        if (this.token && Date.now() < this.tokenExpiresAt) {
        return this.token;
        }

        const client = this.createVtbClient();
        const payload = qs.stringify({
        grant_type: 'client_credentials',
        client_id: config.vtb.clientId,
        client_secret: config.vtb.clientSecret,
        });

        try {
        console.log('🔄 Запрос нового токена ВТБ...');
        
        const response = await client.post(
            config.vtb.tokenUrl,
            payload,
            {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            }
        );

        // Кэшируем токен с буфером
        this.token = response.data.access_token;
        this.tokenExpiresAt = Date.now() + 
            (response.data.expires_in - this.BUFFER_SECONDS) * 1000;

        console.log(`✅ Токен получен, истекает через ${response.data.expires_in}с`);
        return this.token;

        } catch (error) {
        console.error('❌ VTB OAuth error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: {
            url: error.config?.url,
            method: error.config?.method,
            }
        });

        // Пробрасываем ошибку с понятным сообщением
        const errorCode = error.response?.data?.error || error.code;
        const errorDesc = error.response?.data?.error_description || error.message;
        throw new Error(`VTB_AUTH_FAILED: ${errorCode} - ${errorDesc}`);
        }
    }

    /**
     * Принудительное обновление токена
     * @returns {Promise<string>}
     */
    async refreshToken() {
        this.token = null;
        this.tokenExpiresAt = 0;
        return this.getToken();
    }

    /**
     * Проверка валидности токена
     * @returns {boolean}
     */
    isTokenValid() {
        return !!this.token && Date.now() < this.tokenExpiresAt;
    }
}

// Экспортируем синглтон
module.exports = new VtbAuthService();