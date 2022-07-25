class HotPayError extends Error{
    constructor(message) {
        super(message);
    }
}

class SMSException extends Error{
    constructor(message) {
        super(message);
    }
}

class IncorrectSmsCode extends Error{
    constructor(message) {
        super(message);
    }
}

module.exports = { HotPayError, SMSException, IncorrectSmsCode }