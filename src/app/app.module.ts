import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { WEB3, mnemonic } from './service/token';
const Web3 = require('web3');

import { HDWalletProvider } from 'truffle-hdwallet-provider';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { EthcontractService } from './service/ethcontract.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
      EthcontractService , {
      provide: WEB3,
      useFactory: () => new Web3( new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/privatekey') ||
          Web3.givenProvider  || Web3.providers.HttpProvider('http://localhost:8545') ) ,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
