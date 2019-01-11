const crypto = require('crypto');
const InitHelper = require('./app/helpers/init')

global.NUM_ACCOUNTS = 10;
global.NUM_NODES = 5;

// index accounts by address (in this case, as noted in account.js, just the public key)
global.accountMap = {};

(async function(){
	await InitHelper.createAccounts();
	console.log("Done creating accounts.");
	console.log("Number of accounts: ", Object.keys(accountMap).length);
})();