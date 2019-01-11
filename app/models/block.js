crypto = require('crypto')
objectHash = require('object-hash')

exports.Block = class Block {
	// there's no reason to use a DAG in this ultra-simplified simulation, because
	// - no ASIC resistance desired
	// - no "light" clients/nodes
	constructor(transactions, beneficiary, number, timestamp, mixHash, nonce, parentHash) {
		this.transactions = transactions;
		this.beneficiary = beneficiary;
		this.number = number;
		this.timestamp = timestamp;
		this.mixHash = mixHash;
		this.nonce = nonce;
		this.header = {};
		this.parentHash = parentHash;
	}
}