var Token = artifacts.require("./Token.sol");

contract('Token', function(accounts){
    var tokeninstance;
    it('initializes the contract with name and symbol', function(){
       return Token.deployed().then(function(instance){
           tokeninstance = instance;
           return tokeninstance.name();
       }).then(function(name){
            assert.equal(name,'IA Token', 'has correct name')
            return tokeninstance.symbol();
       }).then(function(symbol){
        assert.equal(symbol,'IA', 'has correct symbol')
          return tokeninstance.standard(); 
       }).then(function(standard){
        assert.equal(standard,'IA v1.0',"standard v1.0")
       }); 
    })
    it('sets the total supply on deployment', function() {
        return Token.deployed().then(function(instance){
            tokeninstance = instance;
            return tokeninstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1 million');
        return tokeninstance.balances(accounts[0]);
        }).then(function(adminbalance){
            assert.equal(adminbalance.toNumber(), 1000000, 'it allocates initial supply to admin account')        
        });
    });

    it('transfers token ownership', function(){
        return Token.deployed().then(function(instance){
            tokeninstance = instance ;
            // testing the require statement by sending more than the sender's wallet balance
            //  *************
        //   used to test require function
        // return tokeninstance.transfer.call(accounts[1], 9999999999999999999); 
        //  }).then(assert.fail).catch(function(error){
        // assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
        // ************************
       
        //In general call method is to used to use method of another object in javascript 
            // CALL method definition here: call here does not create a transaction and hence 
            // returns success/failure it will work even without call but however transaction 
            // is created and hence returns a transaction receipt
            return tokeninstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
        }).then(function(success){
            assert.equal(success,true,'it returns true')
            return tokeninstance.transfer(accounts[1], 250000, {from: accounts[0]});
        }).then(function(receipt){
             assert.equal(receipt.logs.length, 1, 'triggers one event');
             assert.equal(receipt.logs[0].event,'Transfer', 'should be the "Transfer" event');
             assert.equal(receipt.logs[0].args._from, accounts[0],'logs where the account tokens are transfered from');
             assert.equal(receipt.logs[0].args._to, accounts[1],'logs where the account tokens are transfered to');
             assert.equal(receipt.logs[0].args._value, 250000,'logs the transfered amount');
        
            return tokeninstance.balances(accounts[1]);            
        }).then(function(bal){
            assert.equal(bal.toNumber(),250000,'adds amount to the recieving amount');
            return tokeninstance.balances(accounts[0]);
        }).then(function(bal){
            assert.equal(bal.toNumber(),750000, 'it deducts same value from the sending account');
        });
      })
      it('approves dedicated token transfer', function(){
          return Token.deployed().then(function(instance){
              tokeninstance = instance;
            return tokeninstance.approve.call(accounts[1], 100);
          }).then(function(success){
            assert.equal(success, true, 'it returns true')
            return tokeninstance.approve(accounts[1], 100);
          }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event,'Approve', 'should be the "Approve" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0],'logs the account which authorizes token transfer');
            assert.equal(receipt.logs[0].args._spender, accounts[1],'logs the account authorized to');
            assert.equal(receipt.logs[0].args._value, 100,'logs the authorized amount');
        return tokeninstance.allowance(accounts[0],accounts[1]); 
        }).then(function(allow){
            assert.equal(allow.toNumber(), 100,'Spender is allowed to transfer')
        });
      })

      it('handles dedicated transfer of token', function(){
        return Token.deployed().then(function(instance){
            tokeninstance = instance;
            fromaccount = accounts[2];
            toaccount = accounts[3];
            spendingaccount = accounts[4];

            //transfering tokens to accounts[2] so that it has some tokens for testing 
        return tokeninstance.transfer(fromaccount,100, {from: accounts[0] });          
        }).then(function(receipt){
            //approving spendingaccount to spend 10 tokens from fromaccount
            return tokeninstance.approve(spendingaccount, 10 , {from : fromaccount});
        }).then(function(receipt){
            // boolean test
            return tokeninstance.transferFrom.call(fromaccount, toaccount , 10,{from : spendingaccount});
        }).then(function(success){
            assert.equal(success, true, 'transferfrom function returns true')
            return tokeninstance.transferFrom(fromaccount, toaccount , 10,{from : spendingaccount});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event,'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args.fromaccount, accounts[0],'logs the account which transfers token transfer');
            assert.equal(receipt.logs[0].args.toaccount, accounts[1],'logs the account to which tokens are transfered to');
            assert.equal(receipt.logs[0].args._value, 100,'logs the authorized amount');
        return tokeninstance.balances(fromaccount);        
        }).then(function(bal){
            assert.equal(bal.toNumber(), 90, 'deducts the amount from sending account');
            return tokeninstance.balances(toaccount);        
        }).then(function(bal){
            assert.equal(bal.toNumber(), 10, 'adds the amount to receiving account');
        return tokeninstance.allowance(fromaccount, spendingaccount);
        }).then(function(allow){
            assert.equal(allow, 0 , 'deducts the amount from the allowance')
        return tokeninstance.transferFrom(fromaccount, toaccount, 9999, {from : spendingaccount}); 
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
           
        });

      });

})