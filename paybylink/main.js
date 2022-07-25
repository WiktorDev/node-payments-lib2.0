const crypto = require('crypto');
const { HttpClient } = require('../HttpClient')
const qs = require('query-string');

class PayByLink extends HttpClient{
    constructor(shopId, hash) {
        super();
        this.shopId = shopId;
        this.hash = hash;
    }
    async generate(price, control=null, description=null, email=null, notifyURL=null, returnUrlSuccess=null, customFinishNote=null, hideReceiver=null){
        let params = {
            shopId: this.shopId,
            price: price.toFixed(2)
        }
        if(!isNull(control)) params.control = control;
        if(!isNull(description)) params.description = description;
        if(!isNull(email)) params.email = email;
        if(!isNull(notifyURL)) params.notifyURL = notifyURL;
        if(!isNull(returnUrlSuccess)) params.returnUrlSuccess = returnUrlSuccess;
        if(!isNull(customFinishNote)) params.customFinishNote = customFinishNote;
        if(!isNull(hideReceiver)) params.hideReceiver = hideReceiver;

        params.signature = this.generateHash(params)
        return await this.doRequest('https://secure.pbl.pl/api/v1/transfer/generate', JSON.stringify(params), "POST")
    }
    async cancelPayment(transactionId, customReason){
        let params = {
            shopId: this.shopId,
            transactionId: transactionId,
            customReason: customReason
        }
        params.signature = this.generateHash(params)
        return await this.doRequest('https://secure.paybylink.pl/api/v1/transfer/cancel', JSON.stringify(params), "POST")
    }
    async generateBlik(price, code, customerIP, control=null, notifyPaymentURL=null, notifyStatusURL=null){
        let params = {
            shopId: this.shopId,
            price: price.toFixed(2),
            code: code,
            customerIP: customerIP
        }
        if(!isNull(control)) params.control = control;
        if(!isNull(notifyPaymentURL)) params.notifyPaymentURL = notifyPaymentURL;
        if(!isNull(notifyStatusURL)) params.notifyStatusURL = notifyStatusURL;
        params.signature = this.generateHash(params)
        return await this.doRequest('https://secure.paybylink.pl/api/v1/transfer/blikauth', JSON.stringify(params), 'POST')
    }
    generateHash(params){
        let hash = `${this.hash}|`;
        hash = hash+Object.values(params).join("|")
        return crypto.createHash('sha256').update(hash).digest('hex')
    }
}

class PayByLinkPSC extends HttpClient{
    constructor(userId, shopId, pin) {
        super();
        this.userId = userId;
        this.shopId = shopId;
        this.pin = pin;
    }
    async generate(amount, return_ok, return_fail, url, control, description=null){
        let params = {
            userid: this.userId,
            shopid: this.shopId,
            amount: amount,
            return_ok: return_ok,
            return_fail: return_fail,
            url: url,
            control: control,
            get_pid: true
        }
        if(!isNull(description)) params.description = description;
        params.hash = this.generateHash(amount)
        return await this.doRequest('https://www.rushpay.pl/api/psc/', qs.stringify(params), "POST", { 'Content-Type': 'application/x-www-form-urlencoded' })
    }
    generateHash(amount){
        return crypto.createHash('sha256').update(`${this.userId}${this.pin}${amount}`).digest('hex')
    }
    async isIpInAllowed(ip){
        let response = await this.doRequest('https://www.rushpay.pl/psc/ips/')
        let array = response.split(',')
        return array.includes(ip)
    }
}

class PayByLinkDB extends HttpClient{
    constructor(hash, login, password) {
        super();
        this.hash = hash;
        this.login = login;
        this.password = password;
    }
    async generate(price, description, control){
        let params = {
            price: price*100,
            description: description,
            control: control
        }
        params.signature = this.generateHash(params)
        return await this.doRequest('https://paybylink.pl/direct-biling/', JSON.stringify(params), 'POST', null, [this.login, this.password])
    }
    async getPaymentInfo(pid){
        let params = {
            pid: pid,
            signature: crypto.createHash('sha256').update(`${pid}|${this.hash}`).digest('hex')
        }
        return await this.doRequest('https://paybylink.pl/direct-biling/transactionStatus.php', JSON.stringify(params), "POST", null, [this.login, this.password])
    }
    generateHash(params){
        let hash = Object.values(params).join("|")
        hash = hash+`|${this.hash}`
        return crypto.createHash('sha256').update(hash).digest('hex')
    }
    async isIpInAllowed(ip){
        let response = await this.doRequest('https://www.rushpay.pl/psc/ips/')
        let array = response.split(',')
        return array.includes(ip)
    }
}

function isNull(data){
    return data == null;
}

module.exports = { PayByLink, PayByLinkPSC, PayByLinkDB }