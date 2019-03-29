const Owned = artifacts.require("Owned");
const SafeMath = artifacts.require("SafeMath");
const Ebank = artifacts.require("Ebank");


module.exports = function(deployer, network, accounts) {
    console.log('accounts list ', accounts, network);
    deployer.deploy(Owned);
    deployer.link(Owned, Ebank);
    deployer.deploy(SafeMath);
    deployer.link(SafeMath, Ebank);
    deployer.deploy(Ebank);
};


// truffle migrate -f 2
// truffle migrate -f 2 --network rinkeby