// Бизнес-логика (вызовы к API шлюза)

// backend/src/services/paymentService.js

const httpClient = require('../utils/httpClient');
const crypto = require('crypto');
const config = require('../config');

class PaymentService {
    async createOrder(orderData) {
        const payload = {
        orderId: orderData.orderId || crypto.randomUUID(),
        orderName: orderData.orderName || orderData.description || 'Оплата услуг Guru-Mos',
        amount: {
            value: orderData.amount,
            code: orderData.currency || 'RUB'
        },
        expire: orderData.expire || this._getExpireDate(20),
        
        // 🔥 Используем публичные URL из .env
        returnUrl: process.env.PUBLIC_RETURN_URL || orderData.returnUrl,
        
        customer: orderData.customer,
        returnPaymentData: orderData.returnPaymentData,
        additionalInfo: orderData.additionalInfo,
        paymentDetail: orderData.paymentDetail,
        binding: orderData.binding
        };

        // Удаляем undefined поля
        Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) delete payload[key];
        });

        console.log('📦 Запрос на создание ордера:', JSON.stringify(payload, null, 2));
        
        const response = await httpClient.post('/v1/orders', payload);
        const order = response.data.object || response.data;
        
        console.log('✅ Ордер создан. orderCode:', order.orderCode, 'payUrl:', order.payUrl);
        return order;
    }

    async getOrder(orderCode) {
        const response = await httpClient.get(`/v1/orders/${orderCode}`);
        return response.data.object || response.data;
    }

    async cancelOrder(orderCode) {
        const response = await httpClient.post(`/v1/orders/${orderCode}/cancel`, {});
        return response.data.object || response.data;
    }

    async createRefund(refundData) {
        const payload = {
        paymentId: refundData.paymentId,
        amount: {
            value: refundData.amount,
            code: refundData.currency || 'RUB'
        },
        description: refundData.description
        };

        const response = await httpClient.post('/v1/refunds', payload);
        return response.data.object || response.data;
    }

    async getRefund(refundId) {
        const response = await httpClient.get(`/v1/refunds/${refundId}`);
        return response.data.object || response.data;
    }

    _getExpireDate(minutes) {
        const date = new Date();
        date.setMinutes(date.getMinutes() + minutes);
        return date.toISOString();
    }
    }

module.exports = new PaymentService();