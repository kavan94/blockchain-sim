const crypto = require('crypto');
const cla = require('command-line-args');

const InitService = require('./app/services/init');
const TerminalService = require('./app/services/terminal');

global.NUM_ACCOUNTS = 10;
global.NUM_NODES = 5;
global.AVG_BLOCK_TIME = null; // time in seconds for a new block to be mined
global.HASH_RATE = 10; // number of tries each "node" gets per second
global.TARGET_HEX_LEADING_ZEROES = 2; // number of leading zeroes required in hex
global.LATENCY = 1.5; // max # of seconds delay in node-to-node communication

// index accounts by address (in this case, as noted in account.js, just the public key)
global.ACCOUNT_MAP = {};
global.NODE_MAP = {};

global.TOTAL_TRIES = 0;

// run mode options (just 1 right now)
const claOptConfig = [
	{ name: 'debug', alias: 'd', type: Boolean }
];
const claOpts = cla(claOptConfig);

if (claOpts.debug) {
	global.CONSOLE_LOG = console.log;
} else {
	TerminalService.InitalizeLayout();
	global.CONSOLE_LOG = TerminalService.verboseLog;
}

run = async () => {
	InitService.calculateAvgTimeToMine();
	CONSOLE_LOG(`With current settings, a block is expected to take an average of ${AVG_BLOCK_TIME} sec`);
	CONSOLE_LOG('Setting up accounts and nodes...');
	InitService.createNodes();
	await InitService.createAccounts();
	CONSOLE_LOG(ACCOUNT_MAP);
	CONSOLE_LOG(`${Object.keys(ACCOUNT_MAP).length} accounts created.`);
	CONSOLE_LOG(`${Object.keys(NODE_MAP).length} nodes created.`);
	CONSOLE_LOG('Creating genesis block...');
	InitService.createAndBroadcastGenesisBlock();
};

run().catch((error) => {
	CONSOLE_LOG("It broke.");
	CONSOLE_LOG(error);
});