App = {

    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenprice: 1000000000000000,
    tokensold:0,
    tokensavailable: 750000,
    init: function() {
        console.log("App initialised...")
        return App.initWeb3();
    },
    initWeb3: function() {
        if (typeof web3 !== 'undefined') {
          // If a web3 instance is already provided by Meta Mask.
          App.web3Provider = web3.currentProvider;
          web3 = new Web3(web3.currentProvider);
          console.log("meta");
        } else {
          // Specify default instance if no web3 instance provided
          App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          web3 = new Web3(App.web3Provider);
          console.log("metassssssssssssssssss");
        }   
        return App.initContracts();
    },
    initContracts : function() {
        $.getJSON("Tokensale.json", function(tokensale){
            App.contracts.Tokensale = TruffleContract(tokensale);
            App.contracts.Tokensale.setProvider(App.web3Provider);
            App.contracts.Tokensale.deployed().then(function(tokensale){
                console.log("Token sale address:", tokensale.address);
            })
        }).done(function(){
                $.getJSON("Token.json", function(token){
                    App.contracts.Token = TruffleContract(token);
                    App.contracts.Token.setProvider(App.web3Provider);
                    App.contracts.Token.deployed().then(function(token){
                        console.log("Token address:", token.address);
                
                     });
                     return App.render();
                 });
            });
        
         
    },

    render: function() {
   
        if(App.loading) {
            return ;
        }
        App.loading = true ;

        var loader = $('#loader');
        var content = $('#content');
        loader.show();
        content.hide();
        //Loading account data
        web3.eth.getCoinbase(function(err, account){
            if(err === null){
                console.log("account", account);
                App.account = account ;
                $('#accountAddress').html("Your Account:" + account);
            }
        })

        App.contracts.Tokensale.deployed().then(function(instance){
            Tokensaleinstance = instance;
            return Tokensaleinstance.tokenprice();
        }).then(function(tokenprice){
            console.log("tokenprice", tokenprice);
            App.tokenprice = tokenprice;
            $('.token-price').html(web3.utils.fromWei(App.tokenprice, 'ether'));
            return Tokensaleinstance.tokensold();
        }).then(function(tokensold){
            App.tokensold = tokensold.toNumber();
        $('.tokens-sold').html(App.tokensold);  
        $('.tokens-available').html(App.tokensavailable);  
            var progresspercent = (App.tokensold / App.tokensavailable)*100;
            $('#progress').css('width', progresspercent + '%');

            App.contracts.Token.deployed().then(function(instance){
             tokeninstance = instance;
             return tokeninstance.balances(App.account);
            }).then(function(balance){
                $('.dapp-balance').html(balance.toNumber());
                    
             App.loading = false;
             loader.hide();
             content.show(); 
        
            });

        });  
        

    },
    buyTokens: function() {
        $('#loader').show();
        $('#content').hide();
        var numberoftokens = $('#numberOfTokens').val();
        App.contracts.Tokensale.deployed().then(function(instance){
        tokensaleinstance = instance ;
        console.log("sds")
        return tokensaleinstance.buyTokens(numberoftokens, {
            from: App.account, 
            value: numberoftokens*App.tokenprice,
            gas: 500000    
        });
        }).then(function(result){
            console.log("Tokens Bought");
            $('form').trigger('reset') // reset number of tokens in form
            $('#loader').hide();
            $('#content').show();
         
        }) 
   
    }
}


$(function() {
    $(window).load(function(){
        App.init();
    })
});