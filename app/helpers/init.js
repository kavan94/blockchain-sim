// helper functions to set up the environment

const account = require('../models/account');
const block = require('../models/block');
const transaction = require('../models/transaction');
const simulatedNode = require('../models/simulated-node');

exports.createAccounts = async () => {
	let accountNames = Array.from(new Array(NUM_ACCOUNTS), (val, index) => { return `Account ${index + 1}`});
	await Promise.all(accountNames.map( async (name) => {
		let newAccount = new account.Account(name);
		await newAccount.initialize();
		ACCOUNT_MAP[newAccount.publicKey] = newAccount;
	}))
}

exports.createNodes = () => {
	let nodesCreated = 0;
	do {
		let newNode = new simulatedNode.Node(`Node ${nodesCreated + 1}`);
		NODE_MAP[newNode.id] = newNode;
		nodesCreated++;
	} while (nodesCreated < NUM_NODES);
}

exports.createAndBroadcastGenesisBlock = async () => {
	// arbitratily, the first account that got created gets the reward for the genesis block
	let beneficiary = Object.keys(ACCOUNT_MAP)[0]
	let genesisBlock = new block.Block([], beneficiary, 0, new Date(), null, null);

	for (let [id, node] of Object.entries(NODE_MAP)) {
		node.addBlockToChain(genesisBlock);
	}
}