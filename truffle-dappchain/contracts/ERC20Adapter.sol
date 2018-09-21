pragma solidity ^0.4.24;
import 'openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol';
import './NeonDistrictCraftingDappChain.sol';

contract ERC20Adapter is Ownable, PausableToken {
    string public name;
    string public symbol;
    uint8  public decimals;
    uint256 public itemId;
    NeonDistrictCraftingDappChain ai;

    // TODOS 
    // * rather than contstructor args totalSupply_ should pass through to the main contract
    // * needs _itemId for main contract
    // * will need to be deployed on mainnet not loom net
    constructor( string _name, string _symbol, uint8 _decimals, uint256 _itemId) public {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        itemId = _itemId;
        ai = NeonDistrictCraftingDappChain(owner);
    }

    function totalSupply() public view returns (uint256){
        return ai.totalSupply(itemId);
    }
}
