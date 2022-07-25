const crypto = require("crypto");
const qs = require('query-string');

class DotPay{
    constructor(shopId, pin, sandbox) {
        this.shopId = shopId;
        this.pin = pin;
        this.url = "https://ssl.dotpay.pl/t2"
        if(sandbox === true) this.url = "https://ssl.dotpay.pl/test_payment";
    }
    generate(amount, currency, description,
             channel=null, chLock=null, ignoreLastPaymentChannel=null, channelGroups=null, redirectUrl=null,
             type=null, buttonText=null, byLaw=null, personalData=null, urlc=null, expirationDate=null, control=null, firstname=null,
             lastname=null, email=null, street=null, streetN1=null, streetN2=null, state=null, addr3=null, city=null,
             postCode=null, phone=null, country=null, lang=null, customer=null, deliveryAddress=null, pInfo=null, pEmail=null,
             blikCode=null, gpToken=null, apToken=null
    ){
        let data = {
            api_version: "next",
            id: this.shopId,
            amount: amount,
            currency: currency,
            description: description
        }
        if(!isNull(channel)) data.channel = channel;
        if(!isNull(chLock)) data.ch_lock = chLock;
        if(!isNull(ignoreLastPaymentChannel)) data.ignore_last_payment_channel = ignoreLastPaymentChannel;
        if(!isNull(channelGroups)) data.channel_groups = channelGroups;
        if(!isNull(redirectUrl)) data.url = redirectUrl;
        if (!isNull(type)) data.type = type;
        if (!isNull(buttonText)) data.buttontext = buttonText;
        if (!isNull(byLaw)) data.bylaw = byLaw;
        if (!isNull(personalData)) data.personal_data = personalData;
        if (!isNull(urlc)) data.urlc = urlc;
        if (!isNull(expirationDate)) data.expirationDate = expirationDate;
        if (!isNull(control)) data.control = control;
        if (!isNull(firstname)) data.firstname = firstname;
        if (!isNull(lastname)) data.lastname = lastname;
        if (!isNull(email)) data.email = email;
        if (!isNull(street)) data.street = street;
        if (!isNull(streetN1)) data.street_n1 = streetN1;
        if (!isNull(streetN2)) data.street_n2 = streetN2;
        if (!isNull(state)) data.state = state;
        if (!isNull(addr3)) data.addr3 = addr3;
        if (!isNull(city)) data.city = city;
        if (!isNull(postCode)) data.postcode = postCode;
        if (!isNull(phone)) data.phone = phone;
        if (!isNull(country)) data.country = country;
        if (!isNull(lang)) data.lang = lang;
        if (!isNull(customer)) data.customer = customer;
        if (!isNull(deliveryAddress)) data.deladdr = deliveryAddress;
        if (!isNull(pInfo)) data.p_info = pInfo;
        if (!isNull(pEmail)) data.p_email = pEmail;
        if (!isNull(blikCode)) data.blik_code = blikCode;
        if (!isNull(gpToken)) data.gp_token = gpToken;
        if (!isNull(apToken)) data.ap_token = apToken;

        data.chk = this.generateChk(data);
        return `${this.url}/?${qs.stringify(data)}`
    }
    generateUrlcSignature(payload){
        let string = `${this.pin}`
        Object.keys(payload).forEach((key)=>{
            string += payload[key]
        })
        return crypto.createHash('sha256').update(string).digest('hex')
    }
    generateChk(object){
        let keys = Object.keys(object)
        let sortedObject = {};

        for (let i in keys.sort()) {
            sortedObject[keys[i]] = object[keys[i]];
        }

        object = sortedObject;
        object['paramsList'] = Object.keys(object).join(';')

        Object.keys(object).forEach(item => object[item] = object[item].toString());

        let hmac = crypto.createHmac("sha256", this.pin);
        return hmac.update(JSON.stringify(object)).digest("hex");
    }
}

function isNull(data){
    return data == null;
}

module.exports = { DotPay }