pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol";
import "./ERC721DAppToken.sol";

/**
 * @title Full ERC721 Token for Loom DAppChains
 * This implementation includes all the required and some optional functionality of the ERC721
 * standard, it also contains some required functionality for Loom DAppChain compatiblity.
 */
contract CryptoCardsDappChain is ERC721DAppToken, ERC721Token, ERC721Receiver {
  // Transfer Gateway contract address
  address public gateway;

  /**
    * @dev Constructor function
    */
  constructor(address _gateway) ERC721Token("CryptoCardsDappChain", "CRC") public {
    gateway = _gateway;
  }

  // Called by the gateway contract to mint tokens that have been deposited to the Mainnet gateway.
  function mintToGateway(uint256 _uid) public {
    require(msg.sender == gateway);
    _mint(gateway, _uid);
  }

  function onERC721Received(
    address _from,
    uint256 _tokenId,
    bytes _data
  ) public returns(bytes4) {
    return ERC721_RECEIVED;
  }
}
