// helper functions to set up the environment

const account = require('../models/account')

exports.createAccounts = async () => {
	let accountNames = Array.from(new Array(NUM_ACCOUNTS), (val, index) => { return `Account ${index + 1}`});
	await Promise.all(accountNames.map( async (name) => {
		let newAccount = new account.Account(name);
		await newAccount.initialize();
		ACCOUNT_MAP[newAccount.publicKey] = newAccount;
	}))
}