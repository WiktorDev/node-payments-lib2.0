class SMSException extends Error{
    constructor(message) {
        super(message);
    }
}

class WrongCodeFormat extends Error{
    constructor(message) {
        super(message);
    }
}

module.exports = { SMSException, WrongCodeFormat }