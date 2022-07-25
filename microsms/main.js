const crypto = require('crypto');
const { HttpClient } = require('../HttpClient')
const qs = require('query-string');
const { SMSException, WrongCodeFormat } = require('./exceptions')

class MicroSMS extends HttpClient{
    constructor(shopid, userid, hash) {
        super();
        this.shopid = shopid;
        this.userid = userid;
        this.hash = hash;
    }
    generate(amount, control=null, return_urlc=null, return_url=null, description=null){
        let signature = crypto.createHash('sha256').update(this.shopid+this.hash+amount).digest('hex');

        let params = {
            shopid: this.shopid,
            signature: signature,
            amount: amount,
            control: control,
            return_urlc: return_urlc,
            return_url: return_url,
            description: description
        }
        return 'https://microsms.pl/api/bankTransfer/?'+qs.stringify(params);
    }

    async isIpAllowed(ip){
        let response = await this.doRequest('https://microsms.pl/psc/ips');
        let array = response.split(',');
        return array.includes(ip);
    }

    async checkCode(code, number){
        let pattern = '^[A-Za-z0-9]{8}$'
        if(code.search(pattern) != 0){
            throw new WrongCodeFormat(`${code} is wrong!`)
        }
        let response = await this.doRequest(`https://microsms.pl/api/v2/index.php?userid=${this.userid}&code=${code}&serviceid=${this.shopid}&number=${number}`)
        if(response.connect == false){
            throw new SMSException(response.data.message)
        }
        if(!response.connect){
            throw new SMSException(response.error.message)
        }
        return response.data.status == 1
    }
}

module.exports = { MicroSMS }