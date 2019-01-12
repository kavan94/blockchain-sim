const crypto = require('crypto');
const objectHash = require('object-hash');
const uuid = require('uuid/v4');

exports.Node = class Node {
	constructor(displayName) {
		this.displayName = displayName;
		this.id = uuid();
		this.chain = {};
	}

	verifyTransaction(transaction, signature) {
		// only step in "verifying" transactions right now, is verifying the signature
		// AKA - transaction is from sender, and hasn't been modified in transit
		let verify = crypto.createVerify('SHA256');
		verify.write(objectHash(transaction));
		verify.end();

		return verify.verify(transaction.sender.publicKey, signature, 'hex')
	}

	verifyBlock(block) {

	}

}