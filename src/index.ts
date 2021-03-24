import Web3 from 'web3';
import fs from 'fs';
import { Account } from 'web3-core';
import { loadConfig } from './config';
import { AccountStore } from './account';

const deployContract = async (
  web3: Web3,
  fromAddress: string,
  abiPath: string,
  binPath: string,
  params: any[]
) => {
  const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
  const contractBin = fs.readFileSync(binPath, 'utf-8');
  const contract = new web3.eth.Contract(contractABI);
  const gasPrice = await web3.eth.getGasPrice();
  const estimateGas = await contract
    .deploy({
      data: '0x' + contractBin,
      arguments: params,
    })
    .estimateGas({ from: fromAddress });
  console.log('estimated gas:', estimateGas);
  const result = await contract
    .deploy({
      data: '0x' + contractBin,
      arguments: params,
    })
    .send({
      from: fromAddress,
      gas: estimateGas,
      gasPrice,
    });
  console.log(result);
};

const invokeContract = async (
  web3: Web3,
  type: 'call' | 'send',
  fromAddress: string,
  contractAbiPath: string,
  contractAddress: string,
  method: string,
  params: any[]
) => {
  const contractABI = JSON.parse(fs.readFileSync(contractAbiPath, 'utf-8'));
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  const gasPrice = await web3.eth.getGasPrice();
  const estimateGas = await contract.methods[method](...params).estimateGas({
    from: fromAddress,
  });
  console.log('estimated gas:', estimateGas);
  const handler = contract.methods[method](...params)[type]({
    from: fromAddress,
    gas: estimateGas,
    gasPrice,
  });
  if (handler.on) {
    handler
      .on('error', (err: Error) => console.log(err))
      .on('transactionHash', (txHash: string) =>
        console.log('transaction hash:', txHash)
      )
      .on('receipt', (receipt: any) => {
        console.log('receipt:', receipt.contractAddress);
      })
      .on('confirmation', (confirmationNumber: any, receipt: any) =>
        console.log('confirmation:', confirmationNumber, receipt)
      );
  }
  const result = await handler;
  console.log('result:', result);
};

const transfer = async (
  web3: Web3,
  fromAccount: Account,
  toAddresses: string[],
  etherValue: string
) => {
  const gasPrice = await web3.eth.getGasPrice();
  for (const to of toAddresses) {
    const tx = {
      to,
      value: web3.utils.toWei(etherValue, 'ether'),
      gasPrice,
      gas: '21000',
    };
    const signedTx = await fromAccount.signTransaction(tx);
    console.log('signed transaction:', signedTx);
    const result = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction!
    );
    console.log('transaction result:', result);
  }
};

const main = async () => {
  const [cmd, ...args] = process.argv.slice(2);

  if (cmd === 'genesis') {
    const [balance, ...addresses] = args;
    const data = {
      config: {
        chainId: 99,
        homesteadBlock: 0,
        eip150Block: 0,
        eip155Block: 0,
        eip158Block: 0,
        byzantiumBlock: 0,
        constantinopleBlock: 0,
        petersburgBlock: 0,
        istanbulBlock: 0,
      },
      alloc: {},
      coinbase: '0x0000000000000000000000000000000000000000',
      difficulty: '0x20000',
      extraData: '',
      gasLimit: '0x2fefd8',
      nonce: '0x0000000000000042',
      mixhash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      parentHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: '0x00',
    };
    for (const address of addresses) {
      Object.assign(data.alloc, {
        [address]: {
          balance: Web3.utils.toWei(balance),
        },
      });
    }
    fs.writeFileSync('genesis.json', JSON.stringify(data, undefined, 2));
    return;
  }

  const config = loadConfig(['config.yaml', 'config.local.yaml']);
  const web3 = new Web3(config.web3.provider);
  const accountStore = new AccountStore(web3);

  for (const item of config.accounts) {
    console.log('load account...');
    const account = accountStore.loadAccount(
      item.name,
      item.keyPath,
      item.password
    );
    const [balance, nonce] = await Promise.all([
      web3.eth.getBalance(account.address),
      web3.eth.getTransactionCount(account.address),
    ]);
    console.log('   name:', item.name);
    console.log('address:', account.address);
    console.log('balance:', web3.utils.fromWei(balance));
    console.log('  nonce:', nonce);
    console.log(Array(80).fill('-').join(''));
  }

  if (cmd === 'transfer') {
    const [amount, fromName, ...toNames] = args;
    const fromAccount = accountStore.getAccount(fromName);
    const toAddresses = toNames.map(
      (name) => accountStore.getAccount(name).address
    );
    await transfer(web3, fromAccount, toAddresses, amount);
  }

  if (cmd === 'deploy') {
    const [fromName, abiPath, binPath, ...ctorParams] = args;
    const fromAddress = accountStore.getAccount(fromName).address;
    await deployContract(web3, fromAddress, abiPath, binPath, ctorParams);
  }

  if (cmd === 'call' || cmd === 'send') {
    const [
      fromName,
      contractAbiPath,
      contractAddress,
      methodName,
      ...methodParams
    ] = args;
    const fromAddress = accountStore.getAccount(fromName).address;
    await invokeContract(
      web3,
      cmd,
      fromAddress,
      contractAbiPath,
      contractAddress,
      methodName,
      methodParams
    );
  }
};

(async () => {
  try {
    await main();
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
