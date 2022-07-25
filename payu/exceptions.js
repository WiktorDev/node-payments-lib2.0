class PayUError extends Error{
    constructor(message) {
        super(message);
    }
}

module.exports = { PayUError }