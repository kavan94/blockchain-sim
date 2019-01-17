const crypto = require('crypto');
const objectHash = require('object-hash');
const uuid = require('uuid/v4');

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
			if (id == this.id) continue;
			//simulated random latency
			setTimeout(() => {
				// send this tx to each of the other nodes to verify
				node.verifyTransaction(transaction.transaction, transaction.signature);
			}, Math.random() * 1000 * LATENCY);
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

		if (valid) {
			CONSOLE_LOG(`Tx ${objectHash(transaction).substring(0,3).concat('...')} verified by ${this.displayName}`);
			this.txList.push(transaction);
		} else {
			CONSOLE_LOG(`Tx ${objectHash(transaction).substring(0,3).concat('...')} rejected by ${this.displayName}`);
		}
	}

	broadcastMinedBlock(block) {
		for (let [id, node] of Object.entries(NODE_MAP)) {
			if (id == this.id) continue;
			// simulated random latency
			setTimeout(() => {
				node.modifyChain(block);
			}, Math.random() * 1000 * LATENCY);
		}
	}

	modifyChain(block) {
		CONSOLE_LOG(`Candidate block ${block.displayLogIdentifier} recieved by node: ${this.displayName}`);
		this.stopMining();
		this.verifyBlock(block);
		this.startMining();
	}

	appendBlock(block) {
		// for verified blocks
		CONSOLE_LOG(`Block ${block.displayLogIdentifier} verified by node: ${this.displayName}`);
		this.chain[block.number] = block;
		this.currentMiningState.hash = objectHash(block.header);
	}

	rejectBlock(block, reason) {
		CONSOLE_LOG(`Block ${block.displayLogIdentifier} rejected by node: ${this.displayName}: ${reason}`);
	}

	stopMining() { clearInterval(this.miningInterval); }

	checkPow(block, parentHash) {
		const hash = crypto.createHash('sha256');
		hash.update(parentHash + block.header.nonce);
		const result = hash.digest('hex');
		return (result.substring(0,2) == "00");
	}

	verifyChain(chain) {
		// just checks that each block satisfies POW using it's parent's header hash. more could go into this obviously
		for (const [num, block] of Object.entries(chain)) {
			if (num == 0) continue;
			if (!this.checkPow(block, chain[num - 1].headerHash)) {
				CONSOLE_LOG(` --- Chain verification failed for ${this.displayName} at ${num-1}-${num} ---`)
				return false;
			}
		}
		return true;
	}

	verifyBlock(block) {
		// could have just always asked for the entire chain, but wanted to only do that when necessary

		// just going to have each node trust the genesis block implicitly for the sake of simplicity
		if (block.number == 0) {
			this.appendBlock(block);
			return;
		}

		// sanity check / basic requirements for the block to be valid. could make these more extensive,
		// but not really the point here
		if (!block.number || !block.miner) {
			this.rejectBlock(block, 'malformed');
			return;
		}

		// block is invalid if miner isn't real
		let minerNode = NODE_MAP[block.miner];
		if (!minerNode) {
			this.rejectBlock(block, 'miner not identified');
			return;
		}

		if (this.chain[block.number]) {
			// already have a block at this index on our chain. either a fork, or a malicious attempt to alter the chain
			CONSOLE_LOG(`--- Potential fork detected: ${this.displayName} recieved ${block.displayLogIdentifier}, already has ${this.chain[block.number].displayLogIdentifier}`);
			this.rejectBlock(block, 'block number already exists');
			// at this point, we'd ask for the entire chain and "weigh" it against ours, however, difficulty is static in this simulation
			// so length is used to form consensus. since we are receiveing for which we already have a version of that same block number in
			// our chain, the competing chain can't be longer. at this point we just assume we just ignore the other block, and wait for more to roll in.
			// the next block should either confirm our chain as the winner or confirm the competing chain as the winner (unless of course it causes another fork)

		} else {
			// we don't already have this block...
			if (this.chain[block.number - 1]) {
				// this is the newest block and fits cleanly on our chain
				if (this.checkPow(block, this.currentMiningState.hash)) {
					this.appendBlock(block);
				} else {
					// we could simply be on the wrong side of a fork
					let candidateChain = minerNode.chain;
					if (Object.keys(candidateChain).length > Object.keys(this.chain).length) {
						if (this.verifyChain(candidateChain)) {
							CONSOLE_LOG(`--- ${this.displayName}'s chain over-written by longer chain from ${minerNode.displayName}`);
							this.chain = Object.assign({}, candidateChain);
							this.currentMiningState.hash = this.chain[Object.keys(this.chain).length - 1].headerHash;
							return;
						}
					}
					// otherwise, this is just a bogus block.
					this.rejectBlock(block, 'POW check failed!');
				}
				
			} else {
				// only possible way to end up here is that we don't have the block we've recieved, but
				// it's not next in chronological order. we may be far behind in the chain
				let candidateChain = minerNode.chain;
				if (Object.keys(candidateChain).length > Object.keys(this.chain).length) {
					if (this.verifyChain(candidateChain)) {
						CONSOLE_LOG(`--- ${this.displayName}'s chain over-written by longer chain from ${minerNode.displayName}`);
						this.chain = Object.assign({}, candidateChain);
						this.currentMiningState.hash = this.chain[Object.keys(this.chain).length - 1].headerHash;
						return;
					}
				}
				// just bogus.
				this.rejectBlock(block, 'block has no valid parent');
			}
		}

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