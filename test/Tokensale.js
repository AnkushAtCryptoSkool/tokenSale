var Token = artifacts.require("./Token.sol");
var Tokensale = artifacts.require("./Tokensale.sol");

contract('Tokensale', function(accounts){

 var tokeninstance ;
 var tokensaleinstance ;
 var tokenprice = 1000000000000000;  
 var numberoftokens;
 var admin = accounts[0];
 var buyer = accounts[1];
 var tokensavailable = 750000;

it('initializes the token with correct values', function(){
    return Tokensale.deployed().then(function(instance){
    tokensaleinstance = instance;
    return tokensaleinstance.address 
    }).then(function(address){
        assert.notEqual(address, 0x0,'has contract address');
    // checking that a reference to token contract exists in tokensale
    return tokensaleinstance.tokencontract();
    }).then(function(address){
        assert.notEqual(address, 0x0,'has token contract address');
    // checking the price at which token is sold
    return tokensaleinstance.tokenprice();    
    }).then(function(price){
        assert.equal(price, tokenprice, 'token price is correct')
    });

});

it('fascilitates token buying',function(){
    return Token.deployed().then(function(instance){
        tokeninstance = instance;
    return Tokensale.deployed();
    }).then(function(instance){

        tokensaleinstance = instance;
        // Provision 75% of all tokens to tokensale contract
        return tokeninstance.transfer(tokensaleinstance.address,tokensavailable, {from: admin})
    }).then(function(receipt){  
        numberoftokens = 10;
        return tokensaleinstance.buyTokens(numberoftokens, {from: buyer, value: numberoftokens*tokenprice }) 
    }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event,'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer,'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberoftokens,'logs the number of tokens purchased');
      return tokensaleinstance.tokensold();
    }).then(function(amount){
        assert.equal(amount.toNumber(), numberoftokens,'increments the amount of tokens sold');
        // to ensure no buying of less/more value other than decided
        // return tokensaleinstance.buyTokens(numberoftokens, {from: buyer, value: 1 })
        // .then(assert.fail).catch(function(error){
        // assert(error.message.indexOf('revert') >= 0,'msg.value must equal number of tokens in wei' );
    
        return tokeninstance.balances(tokensaleinstance.address);
    }).then(function(balance){
        assert.equal(balance.toNumber(), tokensavailable - numberoftokens)
    });
});

it('ends token sale',function(){

    return Token.deployed().then(function(instance){
        tokeninstance = instance;
    return Tokensale.deployed();    
    }).then(function(instance){
        tokensaleinstance = instance;
    return tokensaleinstance.endSale({from: admin })            
    }).then(function(receipt){
    return tokeninstance.balances(admin);
    }).then(function(balance){
    assert.equal(balance.toNumber(),999990,'returns all the unsold token back to admin')    
    return tokensaleinstance.tokenprice();    
    }).then(function(price){
        assert.equal(price.toNumber(),0 ,'tokenprice was reset');
    });       
});


});