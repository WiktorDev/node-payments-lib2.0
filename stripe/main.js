const { HttpClient } = require('../HttpClient')
const qs = require('query-string');
const { SmallAmount } = require('./exceptions')

class Stripe extends HttpClient{
    constructor(apikey) {
        super();
        this.apikey = apikey;
    }
    async generate(successURL, cancelURL, generate_price=false, price){
        let data = {
            success_url: successURL,
            cancel_url: cancelURL,
            mode: 'payment',
            'line_items[0][price]': 'price_1LFfQnGbcIDen2vAqqTwiNXQ',
            'line_items[0][quantity]': '1'
        }
        return await this.doRequest('https://api.stripe.com/v1/checkout/sessions', qs.stringify(data), "POST", {'Authorization': this.apikey})
    }

    async getPaymentInfo(id){
        return await this.doRequest(`https://api.stripe.com/v1/checkout/sessions/${id}`, null, 'GET', {'Authorization': this.apikey})
    }

    async generatePrice(unit_amount, productID, currency='PLN'){
        if(unit_amount < 240){
            throw new SmallAmount(`${unit_amount} is too small! Min value is 240`)
        }
        let data = {
            currency: currency,
            product: productID,
            unit_amount: unit_amount
        }
        return await this.doRequest('https://api.stripe.com/v1/prices', qs.stringify(data), "POST", {'Authorization': this.apikey})
    }
    async getPrice(priceID){
        return await this.doRequest(`https://api.stripe.com/v1/prices/${priceID}`, null, 'GET', {'Authorization': this.apikey})
    }

    async generateProduct(name, description){
        let data = {
            name: name,
            description: description
        }
        return await this.doRequest("https://api.stripe.com/v1/products", qs.stringify(data), 'POST', {'Authorization': this.apikey})
    }
    async getProduct(productID){
        return await this.doRequest(`https://api.stripe.com/v1/products/${productID}`, null, "GET", {'Authorization': this.apikey})
    }
}

module.exports = { Stripe }