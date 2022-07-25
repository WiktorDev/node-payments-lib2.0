const { HotPay, HotPayDirectBilling, HotPaySMS } = require('./hotpay/main')
const { CashBill, CashBillSMS } = require('./cashbill/main')
const { MicroSMS } = require('./microsms/main')
const { Lvlup }= require('./lvlup/main')
const { Stripe } = require('./stripe/main')
const { PayByLink, PayByLinkPSC, PayByLinkDB } = require('./paybylink/main')
const { PayU } = require('./payu/main')
const { DotPay } = require('./dotpay/main')

module.exports = {
    HotPay, HotPayDirectBilling, HotPaySMS,
    CashBill, CashBillSMS,
    MicroSMS, Lvlup, Stripe,
    PayByLink, PayByLinkPSC, PayByLinkDB,
    PayU, DotPay
}