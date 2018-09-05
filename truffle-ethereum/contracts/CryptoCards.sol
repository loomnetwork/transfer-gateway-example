pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract CryptoCards is ERC721Token("CryptoCards", "CCC"), Ownable {
    // is this even used?
  mapping(address => bool) private registered;
  address public gateway;

  constructor (address _gateway) public { gateway = _gateway; }

  function register(address user) onlyOwner external {
    for (uint8 j = 0; j < 5 ; j++) {
      create(user); // Give each new player 5 cards
    }
  }

  function create(address user) private {
    uint256 tokenId = allTokens.length + 1;
    _mint(user, tokenId);
  }

  function depositToGateway(uint tokenId) public {
    safeTransferFrom(msg.sender, gateway, tokenId);
  }
}
