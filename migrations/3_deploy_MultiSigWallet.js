const Owned = artifacts.require("Owned");
const SafeMath = artifacts.require("SafeMath");
const MultiSigWallet = artifacts.require("MultiSigWallet");


module.exports = function(deployer, network, accounts) {
  console.log('accounts correct ', accounts, network);
  deployer.deploy(Owned);
  deployer.link(Owned, MultiSigWallet);
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, MultiSigWallet);
  deployer.deploy(MultiSigWallet);
};
