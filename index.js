const crypto = require('crypto');
const InitHelper = require('./app/helpers/init')

global.NUM_ACCOUNTS = 10;
global.NUM_NODES = 5;
global.AVG_BLOCK_TIME = null; // time in seconds for a new block to be mined
global.HASH_RATE = 10; // number of tries each "node" gets per second
global.TARGET_BINARY_LEADING_ZEROES = 8; // number of leading zeroes required in binary representation

// index accounts by address (in this case, as noted in account.js, just the public key)
global.ACCOUNT_MAP = {};
global.NODE_MAP = {};

run = async () => {
	InitHelper.calculateAvgTimeToMine();
	console.log("With current settings, a block is expected to take an average of " + AVG_BLOCK_TIME + "sec");
	console.log('Setting up accounts and nodes...');
	InitHelper.createNodes();
	await InitHelper.createAccounts();
	console.log(ACCOUNT_MAP);
	console.log(`${Object.keys(ACCOUNT_MAP).length} accounts created.`);
	console.log(`${Object.keys(NODE_MAP).length} nodes created.`);
	console.log('Creating genesis block...');
	InitHelper.createAndBroadcastGenesisBlock();
	console.log(NODE_MAP[Object.keys(NODE_MAP)[0]].chain);
}

run().catch((error) => {
	console.log("It broke.");
	console.log(error);
})