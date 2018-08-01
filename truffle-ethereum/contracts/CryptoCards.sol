pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract CryptoCards is ERC721Token("CryptoCards", "CCC"), Ownable {
  mapping(address => bool) private registered;
  mapping(address => uint256[]) tokensOwned;
  address public gateway;

  constructor (address _gateway) public { gateway = _gateway; }

  function register(address user) onlyOwner external {
    for (int j = 0; j<5 ; j++) {
      create(user); // Give each new player 5 cards
    }
  }

  function create(address user) private {
    uint256 tokenId = allTokens.length + 1;
    tokensOwned[user].push(tokenId);
    _mint(user, tokenId);
  }

  function tokensOf(address user) external view returns(uint256[]) {
    require(user != address(0x0), "Invalid address passed");
    uint256[] memory ids = tokensOwned[user];
    return ids;
  }

  function depositToGateway(uint tokenId) public {
    safeTransferFrom(msg.sender, gateway, tokenId);
  }
}
