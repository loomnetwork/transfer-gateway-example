pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "./ERC20DAppToken.sol";
import "./ERC20Receiver.sol";

/**
 * @title Full ERC20 Token for Loom DAppChains
 */
contract GameTokenDappChain is ERC20DAppToken, StandardToken, ERC20Receiver {
  // Transfer Gateway contract address
  address public gateway;

  string public name = "GameTokenDappChain";
  string public symbol = "GTKDC";
  uint8 public decimals = 18;

  uint256 public constant INITIAL_SUPPLY = 1000000000;

  /**
    * @dev Constructor function
    */
  constructor (address _gateway) public {
    gateway = _gateway;
    totalSupply_ = INITIAL_SUPPLY * (10 ** uint256(decimals));
    balances[_gateway] = totalSupply_;
  }

  // Called by the gateway contract to mint tokens that have been deposited to the Mainnet gateway.
  function mintToGateway(uint256 _amount) public {
    require(msg.sender == gateway);
    totalSupply_ = totalSupply_.add(_amount);
    balances[gateway] = balances[gateway].add(_amount);
  }

  function onERC20Received(
    address _from,
    uint256 amount
  ) public returns(bytes4) {
    return ERC20_RECEIVED;
  }
}