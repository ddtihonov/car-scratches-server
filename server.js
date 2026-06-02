require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// ⚠️ Агент для тестовой среды (не проверять SSL)
// Для PRODUCTION используйте правильные сертификаты!
const httpsAgent = new https.Agent({ 
  rejectUnauthorized: false 
});

app.use(cors());
app.use(express.json());

let tokenCache = {
  token: null,
  expiresAt: 0
};

app.post('/api/auth/token', async (req, res) => {
  try {
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now + 30000) {
      console.log('♻️ Возвращаем кэшированный access_token');
      return res.json({
        access_token: tokenCache.token,
        expires_in: Math.floor((tokenCache.expiresAt - now) / 1000),
        token_type: 'Bearer',
        cached: true
      });
    }

    console.log('🔄 Запрашиваем новый access_token у Платежного шлюза');

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', process.env.PAYMENT_GATEWAY_CLIENT_ID);
    params.append('client_secret', process.env.PAYMENT_GATEWAY_CLIENT_SECRET);

    const response = await axios.post(
      process.env.PAYMENT_GATEWAY_TOKEN_URL,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        httpsAgent: httpsAgent,
        timeout: 10000
      }
    );

    const { access_token, expires_in, token_type } = response.data;

    tokenCache = {
      token: access_token,
      expiresAt: Date.now() + (expires_in - 10) * 1000
    };

    console.log('✅ access_token получен, срок действия:', expires_in, 'сек.');

    res.json({
      access_token,
      expires_in,
      token_type,
      cached: false
    });

  } catch (error) {
    console.error('❌ Ошибка получения access_token:', 
      error.response?.data || error.message);
    
    res.status(502).json({
      error: 'Failed to obtain access_token',
      details: error.response?.data?.description || error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  console.log(`⚠️  SSL verification is DISABLED (test mode only)`);
});