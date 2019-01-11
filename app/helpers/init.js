// helper functions to set up the environment

const account = require('../models/account')

exports.createAccounts = async () => {
	for (var i = 0; i < NUM_ACCOUNTS; i++) {
		let newAccount = new account.Account(`Account ${i}`);
		await newAccount.initialize();
		global.ACCOUNT_MAP[newAccount.publicKey] = newAccount;
	}
}