const { HotPay, HotPayDirectBilling, HotPaySMS } = require('./hotpay')
const { CashBill, CashBillSMS } = require('./cashbill')
const { MicroSMS } = require('./microsms')
const { Lvlup }= require('./lvlup')
const { Stripe } = require('./stripe')
const { PayByLink, PayByLinkPSC, PayByLinkDB } = require('./paybylink')
const { PayU } = require('./payu')
const { DotPay } = require('./dotpay')
const {SimPay} = require("./simpay");
const {Przelewy24} = require('./przelewy24')
const {Paypal} = require('./paypal')

module.exports = {
    HotPay, HotPayDirectBilling, HotPaySMS,
    CashBill, CashBillSMS,
    MicroSMS, Lvlup, Stripe,
    PayByLink, PayByLinkPSC, PayByLinkDB,
    PayU, DotPay, Przelewy24, SimPay, Paypal
}