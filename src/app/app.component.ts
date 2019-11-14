import { Component, OnInit  } from '@angular/core';
import {EthcontractService, tokenAbi, smartContractAddress} from './service/ethcontract.service';
import {MultiSigWalletAbi, MultiSigWalletAddress, liberiDecimals} from './service/token';
import Web3 from "web3";

import {el} from "@angular/platform-browser/testing/src/browser_util";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {
  title = 'Ebank';

  balance = '59.90 Ether';
  transferTo = '';
  amount = 0;
  remarks = '';
  network = '';
  tokenSupply = '';
  tokenName = '';
  tokenSymbol = '';
  balanceByAddress = '';

  addr = '0X..........';
  contract = null;
  contractBalance = 0;

  constructor(private ethcontractService: EthcontractService) {}


    smartContratInstance() {

        const contract = new this.ethcontractService.web3.eth.Contract(tokenAbi.abi, smartContractAddress);

        contract.methods.totalSupply().call().then( (supply) => {
            this.tokenSupply = this.ethcontractService.web3.utils.fromWei(
                this.ethcontractService.web3.utils.hexToNumberString(supply), 'ether');
            if (supply) { console.log('Total Supply ', this.tokenSupply); }

        });

        contract.methods.name().call().then( (tokenName) => {
            this.tokenName = tokenName;
            if (tokenName) { console.log('Token Name ', this.tokenName); }

        });

        contract.methods.symbol().call().then( (symbol) => {
            this.tokenSymbol = symbol;
            if (symbol) { console.log('Token symbol ', this.tokenSymbol); }

        });

        contract.methods.balanceOf('0xfd04cc1c2e6ec59b0507b0cc096650cf5d85d8fa').call().then( (balanceByAddress) => {
            this.balanceByAddress = this.ethcontractService.web3.utils.fromWei(
                this.ethcontractService.web3.utils.hexToNumberString(balanceByAddress), 'ether');
            if (balanceByAddress) { console.log('balanceByAddress  ', this.balanceByAddress); }

        });

        this.getAddressTokenBalanceFromContract('0xfd04cc1c2e6ec59b0507b0cc096650cf5d85d8fa');
    }

    getAddressTokenBalanceFromContract(add) {
        const tknAddress = (add).substring(2);
        const contractData = ('0x70a08231000000000000000000000000' + tknAddress);
        const contractAddr = (smartContractAddress);
        this.ethcontractService.web3.eth.call({
            to: contractAddr,
            data: contractData
            },
            (error, result) => {
                const getTokenBalance = this.ethcontractService.web3.utils.fromWei(
                    this.ethcontractService.web3.utils.hexToNumberString(result), 'ether');

                console.log('Token blance of ', add , ' is ', getTokenBalance );
        });
    }

    transferEther(e) {
    // alert('hello');
    // console.log(this.transferTo);
    // this.ethcontractService.transfertEther(this.addr, '0xa3c8cB1aED0DFF422c029394a9621B298ce8b023', '1000000000000000000');
    // this.ethcontractService.sendTranscationTest();
    // const newAddress = this.ethcontractService.createNewAddress();
    // console.log('newAddress ', newAddress ) ;

    this.smartContratInstance();
  }

  public async confirmTransaction(trxID: string) {
      this.contract.methods.confirmTransaction(trxID)
        .send({from: this.addr})
        .on('transactionHash', (hash) => {
          console.log('TRANSACTION_HASH ', hash);
        })
        .on('confirmation', result => {
          if (result === 6) {
            console.log("Transaction valid ", result)
          }
        })
  }

  public async addUnbankOwner(NewAdminOwner: string) {
    if (this.ethcontractService.web3.utils.isAddress(NewAdminOwner)) {
      this.contract.methods.addUnbankOwner(NewAdminOwner)
        .send({from: this.addr})
        .on('transactionHash', (hash) => {
          console.log('TRANSACTION_HASH ', hash);
        })
        .on('confirmation', result => {
          if (result === 6) {
            console.log("Transaction valid ", result)
          }
      })
    }
  }

  public async validNewUnbankOwner(NewAdminOwner: string) {
    if (this.ethcontractService.web3.utils.isAddress(NewAdminOwner)) {
      this.contract.methods.validNewUnbankOwner(NewAdminOwner)
        .send({from: this.addr})
        .on('transactionHash', (hash) => {
          console.log('TRANSACTION_HASH ', hash);
        })
        .on('confirmation', result => {
          if (result === 6) {
            console.log("Transaction valid ", result)
          }
        })
    }
  }

  async ngOnInit() {


    await window['ethereum'].enable();
    const web3 = new Web3(window['ethereum']);
    const myWeb3 = new Web3(web3.currentProvider);

    this.contract = new myWeb3.eth.Contract(MultiSigWalletAbi, MultiSigWalletAddress);

    if (!window['ethereum'] || !window['ethereum'].isMetaMask) {
      console.log('Please install MetaMask.')
    } else {
      console.log('You have installed METAMASk ', window['ethereum'].networkVersion)
    }

    console.log('Network Version ', this.ethcontractService.getNetworkVersion(window['ethereum'].networkVersion));

    this.addr = await window['ethereum'].selectedAddress;
    console.log('Selected Address ', this.addr);

    await window['ethereum'].on('accountsChanged',  (accounts) => {
      // Time to reload your interface with accounts[0]!
      this.addr =  accounts[0];
      console.log('changed ', accounts[0]);
    });

    await this.contract.methods.getDestinationAddress().call().then( (getDestinationAddress) => {
      console.log('getDestinationAddress ', getDestinationAddress)
    });

    await this.contract.methods.getMultiSigBalance().call().then( (getMultiSigBalance) => {
      this.contractBalance = (getMultiSigBalance / (10**8));
    });

    await this.contract.methods.getTransactionDetails('1234').call({ from: this.addr }).then( (details) => {
      console.log('getTransactionDetails ', details);

      console.log('_destination ', details._destination);
      console.log('_amount ', details._amount / (10**liberiDecimals));
      console.log('_maxSignature ', details._maxSignature  );
      console.log('_minSignatures ', details._minSignatures  );
      console.log('_countSignature ', details._countSignature );
      console.log('_executed ', details._executed);
    });


  }



}
