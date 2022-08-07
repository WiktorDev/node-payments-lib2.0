const {HttpClient} = require("../HttpClient");
const crypto = require("crypto");
const qs = require('query-string');

class Przelewy24 extends HttpClient{
    constructor(merchantId, posId, crc, raportKey, sandbox) {
        super();
        this.merchantId = merchantId;
        this.posId = posId;
        this.crc = crc;
        this.raportKey = raportKey;
        this.url = `https://${sandbox ? 'sandbox' : 'secure'}.przelewy24.pl`
    }
    async generate(sessionId, amount, currency, description, email, urlReturn, urlStatus=null, country="PL", language="pl", channel=null,
                   method=null, client=null, address=null, zip=null, city=null, phone=null, timeLimit=null, waitForResult=null, regulationAccept=null,
                   shipping=null, transferLabel=null, encoding=null, methodRefId=null, cart=null, additional=null
    ){
        let data = {
            merchantId: this.merchantId,
            posId: this.posId,
            sessionId: sessionId,
            amount: amount*100,
            currency: currency,
            description: description,
            email: email,
            country: country,
            language: language,
            urlReturn: urlReturn
        }
        if(!isNull(client)) data.client = client;
        if(!isNull(address)) data.address = address;
        if(!isNull(zip)) data.zip = zip;
        if(!isNull(city)) data.city = city;
        if(!isNull(phone)) data.phone = phone;
        if(!isNull(method)) data.method = method;
        if(!isNull(urlStatus)) data.urlStatus = urlStatus;
        if(!isNull(timeLimit)) data.timeLimit = timeLimit;
        if(!isNull(channel)) data.channel = channel;
        if(!isNull(waitForResult)) data.waitForResult = waitForResult;
        if(!isNull(regulationAccept)) data.regulationAccept = regulationAccept;
        if(!isNull(shipping)) data.shipping = shipping;
        if(!isNull(transferLabel)) data.transferLabel = transferLabel;
        if(!isNull(encoding)) data.encoding = encoding;
        if(!isNull(methodRefId)) data.methodRefId = methodRefId;
        if(!isNull(cart)) data.cart = cart;
        if(!isNull(additional)) data.additional = additional;

        let jsonForSign = JSON.stringify({
            sessionId: sessionId,
            merchantId: this.merchantId,
            amount: data.amount,
            currency: data.currency,
            crc: this.crc
        })
        data.sign = crypto.createHash('sha384').update(jsonForSign).digest('hex')

        let response = await this.doRequest(this.url+"/api/v1/transaction/register", qs.stringify(data), "POST", null, [this.posId, this.raportKey])
        if(response.code){
            return { error: true, message: response.error }
        }
        return { error: false, url: `${this.url}/trnRequest/${response.data.token}`, token: response.data.token}
    }
    async verifyTransaction(payload){
        let data = {
            merchantId: this.merchantId,
            posId: this.posId,
            sessionId: payload.sessionId,
            amount: payload.amount,
            currency: payload.currency,
            orderId: payload.orderId
        }
        let jsonForSign = JSON.stringify({
            sessionId: payload.sessionId,
            orderId: payload.orderId,
            amount: payload.amount,
            currency: payload.currency,
            crc: this.crc
        })
        data.sign = crypto.createHash('sha384').update(jsonForSign).digest('hex')
        return await this.doRequest(this.url+'/api/v1/transaction/verify', qs.stringify(data), "PUT", null, [this.posId, this.raportKey])
    }
    async getPaymentMethods(lang){
        return await this.doRequest(`${this.url}/api/v1/payment/methods/${lang}`, null, "GET", null, [this.posId, this.raportKey])
    }
}

function isNull(data){
    return data == null;
}

module.exports = { Przelewy24 }