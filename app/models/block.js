crypto = require('crypto')
objectHash = require('object-hash')

exports.Block = class Block {
	// there's no reason to use a DAG in this ultra-simplified simulation, because
	// - no ASIC resistance desired
	// - no "light" clients/nodes
	constructor(transactions, beneficiary, number, timestamp, nonce, parentHash) {
		this.header = {
			parentHash: parentHash,
			nonce: nonce,
			txHash: objectHash({ tx: this.transactions })
		};
		this.transactions = transactions;
		this.beneficiary = beneficiary;
		this.number = number;
		this.timestamp = timestamp;
		this.parentHash = parentHash;
		this.reward = 100;

		// simple, short, unique identifier for logging purposes
		this.displayLogIdentifier = this.number + '-' + this.headerHash.substring(0,5).concat('...');
	}

}