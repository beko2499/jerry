/**
 * Universal SMM Panel API v2 Client
 * Works with any provider using the standard SMM Panel API format
 * Uses built-in https/http modules — no external dependencies needed
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

class SmmApi {
    constructor(apiUrl, apiKey) {
        this.apiUrl = apiUrl.replace(/\/+$/, '');
        this.apiKey = apiKey;
    }

    _request(params) {
        return new Promise((resolve, reject) => {
            const body = new URLSearchParams({ key: this.apiKey, ...params }).toString();
            const parsed = new URL(this.apiUrl);
            const mod = parsed.protocol === 'https:' ? https : http;

            const options = {
                hostname: parsed.hostname,
                port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
                path: parsed.pathname + parsed.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(body),
                },
            };

            const req = mod.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.error) return reject(new Error(json.error));
                        resolve(json);
                    } catch (e) {
                        reject(new Error(`Invalid JSON response: ${data.substring(0, 200)}`));
                    }
                });
            });

            req.on('error', reject);
            req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });
            req.write(body);
            req.end();
        });
    }

    /** Get list of all services from provider */
    async getServices() {
        return this._request({ action: 'services' });
    }

    /** Get provider balance */
    async getBalance() {
        return this._request({ action: 'balance' });
    }

    /** Place an order */
    async addOrder(serviceId, link, quantity) {
        return this._request({
            action: 'add',
            service: serviceId,
            link,
            quantity,
        });
    }

    /** Check single order status */
    async getOrderStatus(orderId) {
        return this._request({
            action: 'status',
            order: orderId,
        });
    }

    /** Check multiple orders status (up to 100) */
    async getMultipleOrderStatus(orderIds) {
        return this._request({
            action: 'status',
            orders: orderIds.join(','),
        });
    }

    /** Request refill for an order */
    async createRefill(orderId) {
        return this._request({
            action: 'refill',
            order: orderId,
        });
    }

    /** Cancel orders */
    async cancelOrders(orderIds) {
        return this._request({
            action: 'cancel',
            orders: Array.isArray(orderIds) ? orderIds.join(',') : orderIds,
        });
    }
}

module.exports = SmmApi;
