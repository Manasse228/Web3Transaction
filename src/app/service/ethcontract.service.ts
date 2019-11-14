import { Injectable, OnInit, Inject } from '@angular/core';
import {
  WEB3, addressFrom, privateKey, addressTo,
  AdminAcount, AdminAcount_privateKey, MultiSigWalletAbi,
} from './token';
import Web3 from 'web3';


const Tx = require('ethereumjs-tx');

export const tokenAbi = require('../../../build/contracts/Ebank.json');
export const smartContractAddress = '0xB812C0A913A5c0E9110E8d99924e5823C1609897';


@Injectable({
  providedIn: 'root'
})
export class EthcontractService implements OnInit {
  constructor(@Inject(WEB3) public web3: Web3) {}

  async ngOnInit() {
    //this.web3.eth.defaultAccount = '0x2F7F14890118f3908732DD3A71bEd7DB886CbA4b';
  }

  public getNetworkVersion(networkID: any)  {
    if (networkID == 1) {
      return 'Ethereum Main Network';
    }
    if (networkID == 2) {
      return 'Morden Test network';
    }
    if (networkID == 3) {
      return 'Ropsten Test Network';
    }
    if (networkID == 4) {
      return 'Rinkeby Test Network';
    }
    if (networkID == 5) {
      return 'Goerli Test Network';
    }
    if (networkID == 42) {
      return 'Kovan Test Network';
    }
  }

  public currentAllAccount() {
    return this.web3.eth.getAccounts();
  }
  public getBalanceByAdresse(addr: string) {
    return this.web3.eth.getBalance(addr);
  }
  /*
    Send ether with metamask
   */
  public transfertEther(From: string, To: string, amount: any) {
    if (this.web3.utils.isAddress(From) && this.web3.utils.isAddress(To)) {
      this.web3.eth.sendTransaction({
        from: From,
        to: To,
        value:  amount,
        gas: this.web3.utils.toHex(21000),
        gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('10', 'gwei')),
        data: '0xdf'
      }, (err, transactionHash) => {
        console.log('Error ', err, ' transactionHash ', transactionHash);
      });
    }
  }

  constructTransactionParam(txCount, amount, addrFrom, addrTo ) {
    return {
      nonce: this.web3.utils.toHex(txCount),
      gasLimit: this.web3.utils.toHex(25000),
      gasPrice: this.web3.utils.toHex(10e9), // 10 Gwei
      to: addrTo,
      from: addrFrom,
      value: this.web3.utils.toHex(this.web3.utils.toWei(amount, 'wei'))
    };
  }
  /*
    Send signed transaction
   */
  sendTransactionSigned(txData, cb) {
    const prvKey = new Buffer(privateKey, 'hex');
    const transaction = new Tx(txData);
    transaction.sign(prvKey);
    const serializedTx = transaction.serialize().toString('hex');
    this.web3.eth.sendSignedTransaction('0x' + serializedTx, cb);
  }
  /*
    Send ether without metamask
   */
  public sendTranscationTest() {
    this.web3.eth.getTransactionCount(addressFrom).then(txCount => {

      // construct the transaction data
      const txData = this.constructTransactionParam(txCount, '1000000000000000000', addressFrom, addressTo);

      // fire away!
      this.sendTransactionSigned(txData, (err, txHash) => {
        if (err) { return console.log('error', err); }
        console.log('sent => Transaction Hash', txHash);
      });
    });
  }
  /*
    Create a new address
   */
  public createNewAddress() {
    const genAddr = this.web3.eth.accounts.create();
    return {
      publicAddress : genAddr.address,
      privateKey: genAddr.privateKey
    };
  }



}
