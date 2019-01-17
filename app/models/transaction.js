exports.Transaction = class Transaction {

	constructor(from, to, value, nonce) {
                this.from = from;
                this.to = to;
                this.value = value;
                this.timestamp = new Date();
                this.nonce = nonce;
	}
}