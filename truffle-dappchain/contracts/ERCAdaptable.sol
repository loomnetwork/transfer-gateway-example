pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

import './ERC20Adapter.sol';

contract ERCAdaptable is Ownable{
    using SafeMath for uint256;

    mapping (uint256 => address) public ercAdapterContracts;   // itemIdToAdapterAddress

    // TODO will need to be deployed on mainnet not loomnet
    // Right now this deploys on same network as this contract
    function deployErc20Adapter(string _name, string _symbol, uint8 _decimals, uint256 _typeId) public returns(address){
        ERC20Adapter c = new ERC20Adapter(_name, _symbol, _decimals, _typeId);
        ercAdapterContracts[_typeId] = c;
        return c;
    }
}
