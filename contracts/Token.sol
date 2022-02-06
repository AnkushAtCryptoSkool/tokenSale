// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

contract Token {
uint256 public totalSupply ;
string public name = "IA Token";
string public symbol = "IA";
string public standard = "IA v1.0";

event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 indexed _value
    );

event Approve(
    address indexed _owner,
    address indexed _spender,
    uint256 indexed _value
    );

// For transfer
mapping(address=> uint256) public balances;
// For dedicated transfer
mapping(address=>mapping(address=>uint256)) public allowance; 

constructor(uint256 _initialSupply) public {

balances[msg.sender] = _initialSupply;
totalSupply = _initialSupply ;
}
    
// Transfer tokens

function transfer(address _to , uint256 _value) public returns(bool success){
// ensuring wallet that is sending tokens has more amount that it is trying to send
require(balances[msg.sender] >= _value);
// transfer the balance
balances[msg.sender] -= _value;
balances[_to] += _value;

emit Transfer(msg.sender, _to, _value);
return true;
}

// Delegated transfer

function approve(address _spender, uint256 _value) public returns(bool success){

allowance[msg.sender][_spender] = _value;

emit Approve(msg.sender, _spender, _value);
return true;
}

function transferFrom(address _from ,address _to , uint256 _value) public returns(bool success){

// require _from has enough tokens
require(_value <= balances[_from]);

// allowance is big enough
require(_value <= allowance[msg.sender][_from]);

//change the balance

balances[msg.sender] -= _value;
balances[_to] += _value;

// update the allowance
allowance[_from][msg.sender] -= _value;
// transfer event
emit Transfer(msg.sender, _to, _value);

// return a boolean
return true;

}

}