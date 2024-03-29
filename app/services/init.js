// helper functions to set up the environment

const Account = require('../models/account');
const Block = require('../models/block');
const Node = require('../models/simulated-node');

exports.createAccounts = async () => {
	let accountNames = Array.from(new Array(NUM_ACCOUNTS), (val, index) => { return `Account ${index + 1}`});
	await Promise.all(accountNames.map( async (name) => {
		let newAccount = new Account(name);
		await newAccount.initialize();
		ACCOUNT_MAP[newAccount.publicKey] = newAccount;
	}))
}

exports.createNodes = () => {
	let nodesCreated = 0;
	do {
		let newNode = new Node(`Node ${nodesCreated + 1}`);
		NODE_MAP[newNode.id] = newNode;
		nodesCreated++;
	} while (nodesCreated < NUM_NODES);
}

exports.createAndBroadcastGenesisBlock = async () => {
	// arbitratily, the first account that got created gets the reward for the genesis block
	let beneficiary = Object.keys(ACCOUNT_MAP)[0]
	let genesisBlock = new Block([], beneficiary, 0, new Date(), null, null);

	for (let [id, node] of Object.entries(NODE_MAP)) {
		node.modifyChain(genesisBlock);
	}
}

exports.calculateAvgTimeToMine = () => {	
	// expected # of tries for (n) leading zeros is 16^n for hex, so
	AVG_BLOCK_TIME = (Math.pow(16, TARGET_HEX_LEADING_ZEROES)) / (HASH_RATE * NUM_NODES)
}

exports.startAccountTransactions = () => {
	for (const acct of Object.values(ACCOUNT_MAP)) {
		acct.startTransacting();
	}
}