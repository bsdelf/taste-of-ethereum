# A Taste of Ethereum

## Prerequisite

- Install geth: https://github.com/ethereum/go-ethereum/
- Install nodejs & npm
- Download and build: https://github.com/bsdelf/taste-of-ethereum

## Introduction

Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform. It is the second-largest cryptocurrency by market capitalization, after Bitcoin. Ethereum is the most actively used blockchain.

## Create Account

Account type:

- Externally-owned: controlled by anyone with the private keys (ECDSA).
- Contract: a smart contract deployed to the network, controlled by code.

Account state:

- nonce: a counter that indicates the number of transactions sent from the account.
- balance: the number of "wei" owned by this address. 1 ETH = 1e+18 Wei.
- codeHash: this hash refers to the code of an account on the Ethereum virtual machine (EVM).
- storateRoot: the hash of the root node of a trie which encodes the hash of the storage contents of this account.

![image](https://d33wubrfki0l68.cloudfront.net/36d7f082abf57602921b181a9809af4129d18498/103a4/static/19443ab40f108c985fb95b07bac29bcb/302a4/accounts.png)

Create account:

```
geth account new
```

Put the keystore path to config file named "config.local.yaml".

In following sections, we assume you've already created three accounts, named as "god", "alice", "bob".

## Setup Private Network

### Genesis

```
node dist/src/index.js genesis <balance> <addresses...>
./scripts/init.sh
```

### Up & Run

```
./scripts/run.sh <your miner address>
```

## Interact with Network

### web3.js

web3.js is an official SDK, it's a collection of libraries that allow you to interact with a local or remote ethereum node using HTTP, IPC or WebSocket.

In this project, we've already created some helper codes based on web3.js to demonstrate how to interact with of the Ethereum network.

### Get Balance

Get balance for accounts listed in config file:

```
node dist/src/index.js
```

### Send Transaction

Transfer 1 ETH from God's account to Alice and Bob:

```
node dist/src/index.js transfer 1 god alice bob
```

### Deploy Contract

Build the smart contract:

```
npm run build:contracts:hello
```

the output file will be:

- contracts_hello_sol_hello.abi
- contracts_hello_sol_hello.bin

save these paths to environment variables for further usage:

- `export HELLO_ABI=contracts_hello_sol_hello.abi`
- `export HELLO_BIN=contracts_hello_sol_hello.bin`

now we can use God's account to deploy the "hello" contract:

```
node dist/src/index.js deploy god $HELLO_ABI $HELLO_BIN "hello world"
```

save contract address to environment variable for further usage:

```
export HELLO_ADDR=0xfff...fff
```

### Call Contract Method

Use Alice's account to call `getText` method:

```
node dist/src/index.js call alice $HELLO_ABI $HELLO_ADDR getText
```

Use God's account to call `setText` method:

```
node dist/src/index.js send god $HELLO_ABI $HELLO_ADDR setText "God's contract"
```

Try to use Alice's account to call `setText` method:

```
node dist/src/index.js send alice $HELLO_ABI $HELLO_ADDR setText "Alice's contract"
```

## Further Reading & Resources

- White paper: https://ethereum.org/en/whitepaper/
- Devloper documentation: https://ethereum.org/en/developers/docs/
- EIPs: https://eips.ethereum.org/
- Geth documentation: https://geth.ethereum.org/docs/
- Block explorer: https://etherscan.io/
- Gas station: https://ethgasstation.info/
- Node hosting: https://infura.io/
- Development suite: https://www.trufflesuite.com/ganache
- Contract library: https://github.com/OpenZeppelin/openzeppelin-contracts
