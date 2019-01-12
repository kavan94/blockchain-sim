const crypto = require('crypto');
const objectHash = require('object-hash');
const uuid = require('uuid/v4');

exports.Node = class Node {
	constructor(displayName) {
		this.displayName = displayName;
		this.id = uuid();
		this.chain = {};

		this.txList = [];
		this.currentMiningState = {
			hash: null,
			nonce: null
		}
	}

	addIncomingTransaction(transaction) {
		// takes incoming transaction and broadcasts it to other nodes
		
		for (let [id, node] of Object.entries(NODE_MAP)) {
			if (id = this.id) return;
			//simulated random latency
			setTimeout(() => {
				// send this tx to each of the other nodes to verify
				node.verifyTransaction(transaction.transaction, transaction.signature);
			}, Math.random() * 1000);
		}

		this.verifyTransaction(transaction.transaction, transaction.signature);
	}

	verifyTransaction(transaction, signature) {
		// only step in "verifying" transactions right now, is verifying the signature
		// AKA - transaction is from sender, and hasn't been modified in transit

		let verify = crypto.createVerify('SHA256');
		verify.write(objectHash(transaction));
		verify.end();

		let valid = verify.verify(transaction.from, signature, 'hex');

		if (valid) this.txList.push(transaction);
	}

	broadcastMinedBlock(block) {
		for (let [id, node] of Object.entries(NODE_MAP)) {
			if (id == this.id) return;
			// simulated random latency
			setTimeout(() => {
				node.addBlockToChain(block);
			}, Math.random() * 1000);
		}
	}

	addBlockToChain(block) {
		if (!this.verifyBlock(block)) return;
		this.chain[block.number] = block;
	}

	verifyBlock(block) {
		// just going to have each node trust the genesis block implicitly for the sake of simplicity

		if (block.number == 0) return true;

		// not going to verify any proof of work yet
		if (!this.chain[block.number] && this.chain[block.number - 1]) return true;
	}

}