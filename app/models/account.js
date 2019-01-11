const crypto = require('crypto')
const objectHash = require('object-hash')

// going to use public keys as addresses instead of hashing the key to create an address.
// contracts don't have public keys (in the ethereum blockchain) and hence would present an issue here, but contracts aren't
// involved in this simulation 
exports.Account = class Account {
	constructor(displayName) {
		// display name for purposes of logging and displaying transactions in console
		this.displayName = displayName;

		this.nonce = 0;
		this.etherBalance = 0;
		this.contractFn = null;
		this.storage = {};
	}

	getPublicData() {
		// for other accounts to get this account's public data
		return {
			etherBalance: this.etherBalance,
			nonce: this.nonce,
			publicKey: this.publicKey
		}
	}

	initialize() {
		return new Promise((resolve, reject) => {
			// keypair configuration taken from NodeJS doc recommendations
			crypto.generateKeyPair('rsa',
				{
					modulusLength: 4096,
					publicKeyEncoding: {
						type: 'spki',
						format: 'pem'
					},
					privateKeyEncoding: {
						type: 'pkcs8',
						format: 'pem'
					}
				}, (err, publicKey, privateKey) => {
					if (err) return reject(err);

					this.publicKey = publicKey;

					// instead of assigning the private key to "this", the signTransaction function
					// will keep closure over the scope here and the Account instance can call signTransaction
					// with it's own private key
					this.signTransaction = (transaction) => {
						let sign = crypto.createSign('SHA256');
						sign.write(objectHash(transaction));
						sign.end();

						return sign.sign(privateKey, 'hex')
					}

					this.verifyTransaction = (transaction, signature) => {
						let verify = crypto.createVerify('SHA256');
						verify.write(objectHash(transaction));
						verify.end();

						return verify.verify(transaction.sender.publicKey, signature, 'hex');
					}
					return resolve();
				}
			)
		})
	}
}