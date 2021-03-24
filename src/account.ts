import fs from 'fs';
import Web3 from 'web3';
import { Account } from 'web3-core';

class AccountStore {
  private store = new Map<string, Account>();

  constructor(private web3: Web3) {}

  loadAccount(name: string, keyPath: string, password: string) {
    const keystoreJson = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
    const account = this.web3.eth.accounts.decrypt(keystoreJson, password);
    this.store.set(name, account);
    this.web3.eth.accounts.wallet.add(account);
    return account;
  }

  getAccount(name: string) {
    const account = this.store.get(name);
    if (!account) {
      throw new Error(`Account not found: ${name}`);
    }
    return account;
  }
}

export { AccountStore };
