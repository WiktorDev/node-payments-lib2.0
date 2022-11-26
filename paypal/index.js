const {HttpClient} = require("../HttpClient");

class Paypal extends HttpClient{
    constructor(clientId, clientSecret, sandbox) {
        super();
        this.clientId = clientId;
        this.clientSecret = clientSecret
        this.sandbox = sandbox;
    }

    async generate(returnOk, returnFail, itemName, itemPrice, description){
        const data = JSON.stringify({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": returnOk,
                "cancel_url": returnFail
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": itemName,
                        "sku": "001",
                        "price": itemPrice,
                        "currency": "PLN",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "PLN",
                    "total": itemPrice
                },
                "description": description
            }]
        });

        const url = `${this.sandbox ? 'https://api-m.sandbox.paypal.com': 'https://api-m.paypal.com'}/v1/payments/payment`
        return await this.doRequest(url, data, "POST", {
            'Content-Type': 'application/json'
        }, [this.clientId, this.clientSecret])
    }
    async getPaymentInfo(paymentId){
        const url = `${this.sandbox ? 'https://api-m.sandbox.paypal.com': 'https://api-m.paypal.com'}/v1/payments/payment/${paymentId}`
        return await this.doRequest(url, null, 'GET', null, [this.clientId, this.clientSecret])
    }
    async verifyWebhookSignature(webhookId, headers, body){
        const data = JSON.stringify({
            "auth_algo": headers['paypal-auth-algo'],
            "cert_url": headers['paypal-cert-url'],
            "transmission_id": headers['paypal-transmission-id'],
            "transmission_sig": headers['paypal-transmission-sig'],
            "transmission_time": headers['paypal-transmission-time'],
            "webhook_id": webhookId,
            "webhook_event": body
        });
        const url = `${this.sandbox ? 'https://api-m.sandbox.paypal.com': 'https://api-m.paypal.com'}/v1/notifications/verify-webhook-signature`
        return await this.doRequest(url, data, "POST", {
            'Content-Type': 'application/json'
        }, [this.clientId, this.clientSecret])
    }
    async execute(paymentId, payerId){
        const data = JSON.stringify({
            payer_id: payerId
        })
        const url = `${this.sandbox ? 'https://api-m.sandbox.paypal.com': 'https://api-m.paypal.com'}/v1/payments/payment/${paymentId}/execute`

        return await this.doRequest(url, data, "POST", {
            'Content-Type': 'application/json'
        }, [this.clientId, this.clientSecret])
    }
}

module.exports = { Paypal }