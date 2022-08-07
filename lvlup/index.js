const crypto = require('crypto');
const { HttpClient } = require('../HttpClient')
const { LvlupError } = require('./exceptions')

class Lvlup extends HttpClient{
    constructor(apikey, sandbox) {
        super();
        this.apikey = apikey;
        this.url = "https://api.lvlup.pro/v4/"
        if(sandbox) this.url = "https://api.sandbox.lvlup.pro/v4/"
    }

    async generate(amount, redirectUrl, webhookUrl){
        let params = {
            amount: parseFloat(amount).toFixed(2),
            redirectUrl: redirectUrl,
            webhookUrl: webhookUrl
        }
        return await this.doRequest(`${this.url}wallet/up`, params, 'POST', {'Authorization': `Bearer ${this.apikey}`})
    }

    async getPaymentInfo(id){
        let response = await this.doRequest(`${this.url}wallet/up/${id}`, null, 'GET', {'Authorization': `Bearer ${this.apikey}`})
        if(!response){
            throw new LvlupError('Invalid payment id')
        }
        return response
    }

    async getWallet(){
        return await this.doRequest(`${this.url}/wallet`, null, 'GET', {'Authorization': `Bearer ${this.apikey}`})
    }

    async getPayments(){
        return await this.doRequest(`${this.url}/payments`, null, 'GET', {'Authorization': `Bearer ${this.apikey}`})
    }
}

module.exports = { Lvlup }