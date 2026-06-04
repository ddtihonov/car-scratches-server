// Настроенный экземпляр Axios с токенами

const axios = require('axios');
const https = require('https');
const config = require('../config');

let tokenCache = { token: null, expiresAt: 0 };

const isStrictSSL = config.isProduction;

async function fetchNewToken() {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', config.paymentGateway.clientId);
    params.append('client_secret', config.paymentGateway.clientSecret);

    const httpsAgent = new https.Agent({ 
        rejectUnauthorized: isStrictSSL 
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
    timeout: 10000,
    httpsAgent: new https.Agent({ rejectUnauthorized: isStrictSSL })
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

    return requestConfig;
    }, (error) => Promise.reject(error));

module.exports = httpClient;