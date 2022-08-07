const {HttpClient} = require("../HttpClient");

class SimPay extends HttpClient{
    constructor(x_sim_key, x_sim_password, api_key) {
        super();
        this.authHeaders = {'X-SIM-KEY': x_sim_key, 'X-SIM-PASSWORD': x_sim_password}
        this.api_key = api_key;
    }
    async getServices(){
        return await this.doRequest(`https://api.simpay.pl/directbilling`, null, "GET", this.authHeaders)
    }
    async getService(serviceId){
        return await this.doRequest(`https://api.simpay.pl/directbilling/${serviceId}`, null, "GET", this.authHeaders)
    }
    async calculate(serviceId, amount){
        return await this.doRequest(`https://api.simpay.pl/directbilling/${serviceId}/calculate?amount=${amount}`, null, "GET", this.authHeaders)
    }
    async getTransactions(serviceId){
        return await this.doRequest(`https://api.simpay.pl/directbilling/${serviceId}/transactions`, null, "GET", this.authHeaders)
    }
    async getTransaction(serviceId, transactionId){
        return await this.doRequest(`https://api.simpay.pl/directbilling/${serviceId}/transactions/${transactionId}`, null, "GET", this.authHeaders)
    }
    async generate(amount, description=null, control=null, returnSuccess=null, returnFailure=null, amountType=null, phoneNumber=null){
        let data = {
            amount: amount,
            amountType: amountType ? amountType : "gross"
        }
        if(!isNull(description)) data.description = description;
        if(!isNull(control)) data.control = control;
        if(!isNull(returnSuccess) || !isNull(returnFailure)){
            data.returns = {}
        }
        if(!isNull(returnSuccess)) data['returns']['success'] = returnSuccess;
        if(!isNull(returnFailure)) data['returns']['failure'] = returnFailure;
        if(!isNull(phoneNumber)) data.phoneNumber = phoneNumber;

        console.log(Object.values(data).join(" "))
        console.log(this.generateSignature(data))
    }
    generateSignature(data){
        let returns = []
        if(data.returns) {
            returns = Object.values(data.returns);
            delete data.returns
        }
        let array = Object.values(data)
        returns.forEach(val => array.push(val))
        return `${array.join("|")}|${this.api_key}`
    }
}

function isNull(data){
    return data == null;
}

module.exports = { SimPay }