const { HttpClient } = require('../HttpClient')
const qs = require('query-string');
const { PayUError } = require('./exceptions')
const crypto = require('crypto');

class PayU extends HttpClient{
    constructor(posId, md5Key, clientId, clientSecret, sandbox) {
        super();
        this.posId = posId;
        this.md5Key = md5Key;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.url = "https://secure.payu.com"
        this.products = []
        if(sandbox === true) this.url = "https://secure.snd.payu.com";
    }
    async oauthAuthorize(){
        let data = {
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret
        }
        let response = await this.doRequest(`${this.url}/pl/standard/oauth/authorize`, qs.stringify(data), "POST")
        if(response.error){
            throw new PayUError(response.error_description)
        }
        return response.access_token;
    }
    addProduct(name, unitPrice, quantity){
        this.products.push({ name, unitPrice, quantity })
    }
    async generate(notifyUrl, customerIp, description, currencyCode, totalAmount, email, buyerLang="pl", extOrderId=null, visibleDescription=null, continueUrl=null){
        let data = {
            merchantPosId: this.posId,
            notifyUrl: notifyUrl,
            customerIp: customerIp,
            description: description,
            currencyCode: currencyCode,
            totalAmount: totalAmount,
            buyer: {
                language: buyerLang,
                email: email
            },
            products: this.products
        }
        if(!isNull(extOrderId)) data.extOrderId = extOrderId;
        if(!isNull(visibleDescription)) data.visibleDescription = visibleDescription;
        if(!isNull(continueUrl)) data.continueUrl = continueUrl;

        let access_token = await this.oauthAuthorize();
        return await this.doRequest(`${this.url}/api/v2_1/orders`, data, "POST", {'Authorization': `Bearer ${access_token}`})
    }

    verifySignature(headers, payload){
        if(!isNull(headers['openpayu-signature'])) {
            let payuHeader = headers['openpayu-signature'];
            let data = [];
            let array = payuHeader.split(';');
            array.forEach(test => {
                let explode = test.split('=')
                if (explode.length === 2) {
                    data[explode[0]] = explode[1]
                }
            })
            let hash = null;
            switch (data.algorithm) {
                case 'MD5':
                    hash = crypto.createHash('md5').update(payload + this.md5Key).digest('hex');
                    break
                case 'SHA1':
                    hash = crypto.createHash('sha1').update(payload + this.md5Key).digest('hex');
                    break
                default:
                    hash = crypto.createHash('sha256').update(payload + this.md5Key).digest('hex');
                    break
            }
            return hash === data.signature;
        }
        return false;
    }
}

function isNull(data){
    return data == null;
}

module.exports = { PayU }