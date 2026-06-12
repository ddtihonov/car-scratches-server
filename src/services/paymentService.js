
// Бизнес-логика (вызовы к API шлюза)
// src/services/paymentService.js

const httpClient = require('../utils/httpClient');
const crypto = require('crypto');

class PaymentService {
    /**
     * Создание ордера (POST /v1/orders)
     */
    async createOrder(orderData) {
        const payload = {
            orderId: orderData.orderId || crypto.randomUUID(),
            orderName: orderData.orderName || orderData.description || 'Оплата услуг Guru-Mos',
            amount: {
                value: orderData.amount,
                code: orderData.currency || 'RUB'
            },
            expire: orderData.expire || this._getExpireDate(20),
            returnUrl: process.env.PUBLIC_RETURN_URL || orderData.returnUrl,
            
            // 🔥 Production структура bundle (отличается от тестовой!)
            bundle: {
                fiscalInfo: {
                    clientEmail: orderData.email || undefined
                },
                items: [
                    {
                        positionId: 1,
                        name: orderData.orderName || "Оплата услуг Guru-Mos",
                        quantity: 1,
                        price: orderData.amount,
                        amount: orderData.amount,
                        taxParams: {
                            taxType: "none"
                        }
                    }
                ]
            },

            returnPaymentData: orderData.returnPaymentData,
            additionalInfo: orderData.additionalInfo,
            paymentDetail: orderData.paymentDetail,
            binding: orderData.binding
        };

        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined) delete payload[key];
        });

        console.log('📦 Запрос на создание ордера:', JSON.stringify(payload, null, 2));
        
        const response = await httpClient.post('/v1/orders', payload);
        const order = response.data.object || response.data;
        
        console.log('✅ Ордер создан. orderCode:', order.orderCode, 'payUrl:', order.payUrl || order.payurl);
        return order;
    }

    /**
     * Получение информации об ордерe (GET /v1/orders/{orderId})
     */
    async getOrder(orderId) {
        const response = await httpClient.get(`/v1/orders/${orderId}`);
        return response.data.object || response.data;
    }

    /**
     * Отмена ордера (POST /v1/orders/{orderId}/cancel)
     */
    async cancelOrder(orderId) {
        const response = await httpClient.post(`/v1/orders/${orderId}/cancel`, {});
        return response.data.object || response.data;
    }

    /**
     * Создание возврата (POST /v1/refunds)
     */
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

    /**
     * Получение информации о возврате (GET /v1/refunds/{refundId})
     */
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