class CashBillError extends Error{
    constructor(message) {
        super(message);
    }
}

class InvalidLanguage extends Error{
    constructor(message) {
        super(message);
    }
}

class InvalidSmsCode extends Error{
    constructor(message) {
        super(message);
    }
}

module.exports = { CashBillError, InvalidLanguage, InvalidSmsCode }