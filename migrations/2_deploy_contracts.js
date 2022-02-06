var Token = artifacts.require('Token.sol');
var Tokensale = artifacts.require('Tokensale.sol');

module.exports = function(deployer) {
  deployer.deploy(Token, 1000000).then(function(){
    var tokenprice = 1000000000000000; // 0.001 Ether
   return deployer.deploy(Tokensale, Token.address, tokenprice); 
  });
};
