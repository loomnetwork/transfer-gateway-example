pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "./ERC20Receiver.sol";


contract GameToken is StandardToken {
  string public name = "GameToken";
  string public symbol = "GTK";
  uint8 public decimals = 18;

  address gateway;

  bytes4 constant ERC20_RECEIVED = 0xbc04f0af;

  using AddressUtils for address;

  // one billion in initial supply
  uint256 public constant INITIAL_SUPPLY = 1000000000;

  constructor (address _gateway) public {
    totalSupply_ = INITIAL_SUPPLY * (10 ** uint256(decimals));
    balances[msg.sender] = totalSupply_;
    gateway = _gateway;
  }

  // Additional functions for gateway interaction, influenced from Zeppelin ERC721 Impl.

  function depositToGateway(uint256 amount) external {
    safeTransferAndCall(gateway, amount);
  }

  function safeTransferAndCall(address _to, uint256 amount) public {
    transfer(_to, amount);
    require(
      checkAndCallSafeTransfer(msg.sender, _to, amount),
      "Sent to a contract which is not an ERC20 receiver"
    );
  }

  function checkAndCallSafeTransfer(address _from, address _to, uint256 amount) internal returns (bool) {
    if (!_to.isContract()) {
        return true;
    }

    bytes4 retval = ERC20Receiver(_to).onERC20Received(_from, amount);
    return(retval == ERC20_RECEIVED);
  }
}
