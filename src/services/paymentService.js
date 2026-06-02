const httpClient = require('../utils/httpClient');

class PaymentService {
    async createOrder(orderData) {
        // POST /v1/orders
        return await httpClient.post('/v1/orders', orderData);
    }

    async getOrder(orderId) {
        // GET /v1/orders/{orderId}
        return await httpClient.get(`/v1/orders/${orderId}`);
    }

    async cancelOrder(orderId) {
        // POST /v1/orders/{orderId}/cancel
        return await httpClient.post(`/v1/orders/${orderId}/cancel`, {});
    }

    async createRefund(refundData) {
        // POST /v1/refunds
        return await httpClient.post('/v1/refunds', refundData);
    }

    async getRefund(refundId) {
        // GET /v1/refunds/{refundId}
        return await httpClient.get(`/v1/refunds/${refundId}`);
    }
    }

module.exports = new PaymentService();