import { Component, OnInit  } from '@angular/core';
import {EthcontractService, tokenAbi, smartContractAddress} from './service/ethcontract.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'Ebank';
  addr = 'add';
  balance = '59.90 Ether';
  transferTo = '';
  amount = 0;
  remarks = '';
  network = '';
  tokenSupply = '';
  tokenName = '';
  tokenSymbol = '';
  balanceByAddress = '';

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
    }

    getAddressTokenBalanceFromContract() {
      return null;
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

  ngOnInit() {

    this.ethcontractService.web3.eth.net.getNetworkType().then( network => this.network = network);
    this.ethcontractService.currentAllAccount().then(
        (result) => {
            // console.log('result result hey ', this.ethcontractService.web3.eth.accounts.givenProvider);
            if (result.length > 0 ) {
                this.addr = result[0];
                this.ethcontractService.getBalanceByAdresse(this.addr).then(
                    (resultB) => {
                        this.balance = this.ethcontractService.web3.utils.fromWei(resultB, 'ether') + ' Ether';
                    }
                );
            } else {
                // this.addr = this.ethcontractService.web3.eth.givenProvider.selectedAddress;
            }
        }
    );



  }



}
