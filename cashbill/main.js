const crypto = require('crypto');
const { HttpClient } = require('../HttpClient')
const qs = require('query-string');
const { CashBillError, InvalidLanguage, InvalidSmsCode } = require('./exceptions')

class CashBill extends HttpClient{
    constructor(shopId, secretPhrase, sandbox) {
        super();
        this.shopId = shopId
        this.secretPhrase = secretPhrase
        this.url = "https://pay.cashbill.pl/ws/rest"
        if(sandbox === true) this.url = "https://pay.cashbill.pl/testws/rest";
    }

    async getPaymentChannels(lang="pl"){
        let response = await this.doRequest(`${this.url}/paymentchannels/${this.shopId}/${lang}`)
        if(!response){
            throw new InvalidLanguage(`${lang} is invalid language!`)
        }
        if(!response[0].id){
            throw new CashBillError(response)
        }
        return response
    }
    async generate(title, amount, currencyCode, description, additionalData, paymentChannel=null, languageCode=null, returnUrl=null, negativeReturnUrl=null, firstName = null, surname = null, email = null, country= null, city = null, postcode = null, street = null, house=null, flat = null, referer=null){
        let params = {
            title: title,
            'amount.value': amount,
            'amount.currencyCode': currencyCode,
            description: description,
            additionalData: additionalData
        }

        if(!isNull(paymentChannel)) params.paymentChannel = paymentChannel;
        if(!isNull(languageCode)) params.languageCode = languageCode;
        if(!isNull(returnUrl)) params.returnUrl = returnUrl;
        if(!isNull(negativeReturnUrl)) params.negativeReturnUrl = negativeReturnUrl;
        if(!isNull(firstName)) params['personalData.firstName'] = firstName;
        if(!isNull(surname)) params['personalData.surname'] = surname;
        if(!isNull(email)) params['personalData.email'] = email;
        if(!isNull(country)) params['personalData.country'] = country;
        if(!isNull(city)) params['personalData.city'] = city;
        if(!isNull(postcode)) params['personalData.postcode'] = postcode;
        if(!isNull(street)) params['personalData.street'] = street;
        if(!isNull(house)) params['personalData.house'] = house;
        if(!isNull(flat)) params['personalData.flat'] = flat;
        if(!isNull(referer)) params.referer = referer;

        params.sign = crypto.createHash('sha1').update(Object.values(params).join("")+this.secretPhrase).digest('hex');

        let response = await this.doRequest(`${this.url}/payment/${this.shopId}`, qs.stringify(params), 'POST')
        if(!response.id){
            throw new CashBillError(response)
        }
        return response
    }

    async setRedirectUrls(id, returnUrl, negativeReturnUrl){
        let params = {
            returnUrl: returnUrl,
            negativeReturnUrl: negativeReturnUrl
        }
        params.sign = crypto.createHash('sha1').update(id + Object.values(params).join("") + this.secretPhrase).digest('hex');

        let response = await this.doRequest(`${this.url}/payment/${this.shopId}/${id}`, qs.stringify(params), "PUT")
        if(response){
            throw new CashBillError(response)
        }
    }

    async getPaymentInfo(id){
        let sign = crypto.createHash('sha1').update(id+this.secretPhrase).digest('hex');
        let response = await this.doRequest(`${this.url}/payment/${this.shopId}/${id}?sign=${sign}`)
        if(!response.status){
            throw new CashBillError(response)
        }
        return response
    }
}

class CashBillSMS extends HttpClient{
    constructor(token) {
        super();
        this.token = token;
        this.url = "https://sms.cashbill.pl/code/"
    }
    async checkCode(code){
        let response =  await this.doRequest(`${this.url}/${this.token}/${code}`)
        if(response.error){
            throw new InvalidSmsCode(`Code ${code} is invalid!`)
        }
        return response
    }
}

function isNull(data){
    return data == null;
}

module.exports = { CashBill, CashBillSMS }