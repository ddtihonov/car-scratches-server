// Бизнес-логика (вызовы к API шлюза)

// backend/src/services/paymentService.js

const httpClient = require('../utils/httpClient');

class PaymentService {
    /**
     * Создание ордера
     * @param {Object} orderData - данные с фронтенда
     */
    async createOrder(orderData) {
        // 🔥 Преобразуем данные в формат API ВТБ
        const payload = {
        orderId: orderData.orderId || `GURU-${Date.now()}`,
        orderName: orderData.description || orderData.orderName || 'Оплата услуг Guru-Mos',
        amount: {
            value: Math.round(orderData.amount * 100), // Рубли → копейки (если требуется)
            code: orderData.currency || 'RUB'
        },
        expire: orderData.expire || this._getExpireDate(20), // По умолчанию 20 минут
        returnUrl: orderData.returnUrl,
        failUrl: orderData.failUrl,
        customer: orderData.customer,
        returnPaymentData: orderData.returnPaymentData,
        additionalInfo: orderData.additionalInfo,
        paymentDetail: orderData.paymentDetail
        };

        // Удаляем undefined поля
        Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
            delete payload[key];
        }
        });

        console.log('📦 Формируем запрос на создание ордера:', payload);
        
        return await httpClient.post('/v1/orders', payload);
    }

    async getOrder(orderId) {
        return await httpClient.get(`/v1/orders/${orderId}`);
    }

    async cancelOrder(orderId) {
        return await httpClient.post(`/v1/orders/${orderId}/cancel`, {});
    }

    async createRefund(refundData) {
        const payload = {
        paymentId: refundData.paymentId,
        amount: {
            value: Math.round(refundData.amount * 100),
            code: refundData.currency || 'RUB'
        },
        description: refundData.description
        };

        return await httpClient.post('/v1/refunds', payload);
    }

    async getRefund(refundId) {
        return await httpClient.get(`/v1/refunds/${refundId}`);
    }

    /**
     * Генерирует дату истечения срока жизни ордера
     * @param {number} minutes - через сколько минут истечет
     */
    _getExpireDate(minutes) {
        const date = new Date();
        date.setMinutes(date.getMinutes() + minutes);
        return date.toISOString(); // Формат: 2023-10-12T12:02:16.883Z
    }
    }

    module.exports = new PaymentService();