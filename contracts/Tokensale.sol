// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;
import "./Token.sol" ;
contract Tokensale {

address admin;
Token public tokencontract;
uint256 public tokenprice;
uint256 public tokensold;

event Sell(address _buyer, uint256 _amount);
constructor(Token _tokencontract, uint256 _tokenprice) public {

admin = msg.sender;
tokencontract = _tokencontract;
tokenprice = _tokenprice;
}
  
function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }


function buyTokens(uint256 _numberoftokens) public payable{
    // Require that value is equal to token
    require(msg.value == multiply(_numberoftokens, tokenprice));    
    // Require that contract has enough tokens
    require(tokencontract.balances(address(this)) >= _numberoftokens);
    // Require that transfer is successful
    require(tokencontract.transfer(msg.sender, _numberoftokens));   
    // Keep track of token sold 
    tokensold += _numberoftokens;
    
    // Trigger sell event 
 
    emit Sell(msg.sender,_numberoftokens);

}


function endSale() public {
    // Require admin 
    require(msg.sender == admin);
    // Transfering remaining tokens to admin
    require(tokencontract.transfer(admin, tokencontract.balances(address(this))));
    // Destroy contract 
       // address payable adminAddress = address(uint160(admin));
    // selfdestruct(admin);
    //   address payable addr = payable(admin);
        // selfdestruct(addr);
    // selfdestruct(payable(admin));
}

}