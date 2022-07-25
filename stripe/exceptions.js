class SmallAmount extends Error{
    constructor(message) {
        super(message);
    }
}

module.exports = { SmallAmount }