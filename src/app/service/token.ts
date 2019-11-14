import { InjectionToken } from '@angular/core';
import Web3 from 'web3';
export const WEB3 = new InjectionToken<Web3>('web3');


export const mnemonic = 'taxi ...';

// From Dar es salam
export const addressFrom = '0x2F7F14890118f3908732DD3A71bEd7DB886CbA4b';
export const privateKey = 'privatekey';


// To Encrybit
export const addressTo = '0xc607107a70258448eE6dD26725dE18F457bba26F';


// AdminAcount
export const AdminAcount = '0x54B191C381060a6b26D9540D7EB389d2F30476bD';
export const AdminAcount_privateKey = '401D12BFCEA7B6B694FDA3FF66B0446C646DD98F56798AC6D2D3D7F6C885D162';

export const MultiSigWalletAbi = require('../../../build/contracts/MultiSigWallet.json').abi;
export const MultiSigWalletAddress = '0xbF771F1f075e9d0579BC9df1f06eB7FB06266614';
export const InfuraLink = "https://rinkeby.infura.io/v3/1ea2d585906a47dcbbfadfccf0daf659";
export const liberiDecimals = 8;

