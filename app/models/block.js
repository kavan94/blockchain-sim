const crypto = require('crypto')
const objectHash = require('object-hash')

module.exports = class Block {
	// there's no reason to use a DAG in this ultra-simplified simulation, because
	// - no ASIC resistance desired
	// - no "light" clients/nodes
	constructor(transactions, miner, number, timestamp, nonce, parentHash) {
		this.header = {
			parentHash: parentHash,
			nonce: nonce,
			txHash: objectHash({ tx: this.transactions })
		};
		this.transactions = transactions;
		this.miner = miner;
		this.number = number;
		this.timestamp = timestamp;
		this.parentHash = parentHash;

		this.headerHash = objectHash(this.header);

		// simple, short, unique identifier for logging purposes
		this.displayLogIdentifier = this.number + '-' + this.headerHash.substring(0,5).concat('...');
	}

}