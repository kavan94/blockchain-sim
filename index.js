const crypto = require('crypto');
const InitHelper = require('./app/helpers/init')

global.NUM_ACCOUNTS = 10;
global.NUM_NODES = 5;

// index accounts by address (in this case, as noted in account.js, just the public key)
global.ACCOUNT_MAP = {};
global.NODE_MAP = {};

run = async () => {
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