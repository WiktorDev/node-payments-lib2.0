const crypto = require('crypto');
const { HttpClient } = require('../HttpClient')
const qs = require('query-string');
const cheerio = require('cheerio');
const { HotPayError, SMSException, IncorrectSmsCode } = require('./exceptions')

class HotPay extends HttpClient{
    constructor(secret, password, psc) {
        super();
        this.secret = secret
        this.password = password;
        this.psc = psc;
    }

    async generate(price, service, redirectURL, orderID, email=null, personal_data=null){
        let params = {
            KWOTA: price,
            NAZWA_USLUGI: service,
            ADRES_WWW: redirectURL,
            ID_ZAMOWIENIA: orderID,
            SEKRET: this.secret
        }
        params['HASH'] = this.generateHash(params)
        params['EMAIL'] = email;
        params['DANE_OSOBOWE'] = personal_data;
        params['TYP'] = 'INIT';

        let url = 'https://platnosc.hotpay.pl/'
        if(this.psc) url = "https://psc.hotpay.pl/"
        let response = await this.doRequest(url, qs.stringify(params), "POST")

        if(!response['STATUS']){
            let responseCopy = response
            const $ = cheerio.load(responseCopy);
            let error = $('.contact-widget-section h2', responseCopy).html()
            if(error != null){
                throw new HotPayError(error)
            }
        }
        return response
    }
    generateHash(params){
        let hash = `${this.password};`;
        hash = hash+Object.values(params).join(";")
        return crypto.createHash('sha256').update(hash).digest('hex')
    }
}

class HotPayDirectBilling extends HttpClient{
    constructor(secret, password) {
        super();
        this.secret = secret;
        this.password = password;
        this.url = "https://directbilling.hotpay.pl/";
    }
    generateHtmlForm(price, service, redirectOK, redirectFail, orderID, button_class=null){
        let form = `
                <form name="order" method="post" action="${this.url}">;
                    <input name="SEKRET" value="${this.secret}" type="hidden">
                    <input name="KWOTA" value="${price}" type="hidden">
                    <input name="NAZWA_USLUGI" value="${service}" type="hidden">
                    <input name="PRZEKIEROWANIE_SUKCESS" value="${redirectOK}" type="hidden">
                    <input name="PRZEKIEROWANIE_BLAD" value="${redirectFail}" type="hidden">
                    <input name="ID_ZAMOWIENIA" value="${orderID}" type="hidden">
                    <button type="submit" class="${button_class}">Zapłać</button>
                </form>
            `;
        return form;
    }
    generateQuery(price, service, redirectOK, redirectFail, orderID){
        let query = {
            SEKRET: this.secret,
            KWOTA: price,
            NAZWA_USLUGI: service,
            PRZEKIEROWANIE_SUKCESS: redirectOK,
            PRZEKIEROWANIE_BLAD: redirectFail,
            ID_ZAMOWIENIA: orderID
        }
        return `${this.url}?${qs.stringify(query)}`
    }
    generateHash(params){
        let string = `${this.password};${params.KWOTA};${params.ID_PLATNOSCI};${params.ID_ZAMOWIENIA};${params.STATUS};${params.SEKRET}`
        return crypto.createHash('sha256').update(string).digest('hex')
    }
}

class HotPaySMS extends HttpClient{
    constructor(secret) {
        super();
        this.secret = secret;
    }
    async isValid(code){
        let url = `https://apiv2.hotpay.pl/v1/sms/sprawdz?sekret=${this.secret}&kod_sms=${code}`
        let response = await this.doRequest(url)
        if(response.status == 'ERROR' && response.tresc != 'BLEDNA TRESC SMS'){
            throw new SMSException(response.tresc)
        } else if(response.status == 'SUKCESS'){
            if(parseInt(response.aktywacja) == 1){
                return true
            }else{
                throw new IncorrectSmsCode('Incorrect sms code')
            }
        }
        throw new IncorrectSmsCode('Incorrect sms code')
    }
}

module.exports = { HotPay, HotPayDirectBilling, HotPaySMS }