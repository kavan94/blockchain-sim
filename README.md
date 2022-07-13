# Blockchain Simulator
A rough simulation of a network of nodes and accounts.

## Overview
As configured, spins up 5 "nodes" which start mining at a rate of 10 attempts / second. A block is valid when it's hash begins with `00` in hex format. This, of course, requires an average of 16^2 tries, and so with 5 nodes making 10 attempts per second, will result in a block approximately every 5 seconds.

The following are easily configurable in `index.js` via global variables, but this will be moved to a `.json` file and configurable via command line arguments shortly.
* Number of accounts / addresses
* Number of nodes
* Hash rate / tries per second
* Target, set as the number of leading zeros in hex form required for a valid block
* Latency - the maximum amount of time, in seconds, it should take for messages to move between nodes

This simulation is very lightweight and implements the following:
* Transaction singature verification (RSA keypair)
* Block verification via confirmation of POW and checking for valid parents / chain sequence
* Consensus by longest valid chain (difficulty doens't change)
  * This means forks will be resolved by the side of the fork which mines the next block
  
There is quite a bit left out. Notably:
* No verification of tx nonce / prevention of double spend
* Account / address balance is determined in a central way, using the account's `Account` instance, rather than each chain being able to verify the account's balance by looking at it's transactions in the chain.
   * This is a priority to fix
* No rewards for mining blocks

Solving these shortcomings, and refactoring to TypeScript (this JS is somewhat messy) are the next steps for this project.

## Usage

This project uses `blessed-contrib` to display a terminal window dashboard. You will want to use a terminal theme which has a black (or very dark) background, and expand your terminal window.

To run the sim:
```
npm install
npm run sim
```

To stop running the sim:
```
ESC
```

Some log messages are suppressed as the `blessed-contrib` rolling log doesn't like displaying objects (this is why `CONSOLE_LOG` global is used throughout the project - it maps to either `console.log` or `verboseLog` depending on mode).
To see these messages, run the project in debug mode:

```
npm run debug
```
