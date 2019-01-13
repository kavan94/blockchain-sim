const crypto = require('crypto');
const objectHash = require('object-hash');
const uuid = require('uuid/v4');
const binstring = require('binstring');

const block = require('./block');

exports.Node = class Node {
	constructor(displayName) {
		this.displayName = displayName;
		this.id = uuid();
		this.chain = {};
		this.candidateBlocksMined = 0;

		this.txList = [];
		this.currentMiningState = {
			hash: null,
			nonce: null
		}

		this.miningInterval = null;
	}

	addIncomingTransaction(transaction) {
		// takes incoming transaction and broadcasts it to other nodes

		for (let [id, node] of Object.entries(NODE_MAP)) {
			if (id = this.id) continue;
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
			if (id == this.id) continue;
			// simulated random latency
			setTimeout(() => {
			}, Math.random() * 1000);
				node.modifyChain(block);
		}
	}

	modifyChain(block) {
		CONSOLE_LOG(`Candidate block ${block.displayLogIdentifier} recieved by node: ${this.displayName}`);
		this.stopMining();
		if (!this.verifyBlock(block)) return;
		CONSOLE_LOG(`Block ${block.displayLogIdentifier} verified by node: ${this.displayName}`);
		this.chain[block.number] = block;
		this.currentMiningState.hash = objectHash(block.header);
		this.startMining();
	}

	stopMining() { clearInterval(this.miningInterval); }

	verifyBlock(block) {
		// just going to have each node trust the genesis block implicitly for the sake of simplicity

		if (block.number == 0) return true;

		// not going to verify any proof of work yet
		// this could cause a permanent fork, so we'll change this soon, to accept candidate blocks
		// even if they have conflicting numbers, and compare them to find the "heaviest" chain
		if (!this.chain[block.number] && this.chain[block.number - 1]) return true;
	}

	attemptHash () {
		this.currentMiningState.nonce = Math.floor(Math.random() * 1000000);
		const hash = crypto.createHash('sha256');
		hash.update(this.currentMiningState.hash + this.currentMiningState.nonce);
		TOTAL_TRIES++;
		return hash.digest('hex');
	}

	wrapBlock () {
		const latestBlockNum = Math.max(...Object.keys(this.chain).map((key) => { return parseInt(key)}));
		return new block.Block(
			this.txList,
			this.id,
			latestBlockNum + 1,
			new Date(),
			this.currentMiningState.nonce,
			objectHash(this.chain[latestBlockNum].header));
	}

	startMining() {
		this.miningInterval = setInterval(() => {
			const result = this.attemptHash();
			if (result.substring(0,2) == "00") {
				// congrats, you mined a block
				CONSOLE_LOG(`Block mined by ${this.displayName}`);
				let myBlock = this.wrapBlock();
				this.modifyChain(myBlock);
				this.broadcastMinedBlock(myBlock);
				this.candidateBlocksMined++;
			}
		}, 1000 / HASH_RATE);
	}

}