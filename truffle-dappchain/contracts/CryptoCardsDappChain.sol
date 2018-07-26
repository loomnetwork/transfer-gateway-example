pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";


/**
 * @title Full ERC721 Token for Loom DAppChains
 * This implementation includes all the required and some optional functionality of the ERC721
 * standard, it also contains some required functionality for Loom DAppChain compatiblity.
 */
contract CryptoCardsDappChain is ERC721Token {
  // Transfer Gateway contract address
  address public gateway;
  mapping(address => uint256[]) tokensOwned;

  /**
    * @dev Constructor function
    */
  constructor(address _gateway) ERC721Token("SampleERC721Token", "SDT") public {
    gateway = _gateway;
  }

  // Called by the gateway contract to mint tokens that have been deposited to the Mainnet gateway.
  function mint(uint256 _uid) public {
    require(msg.sender == gateway);
    tokensOwned[gateway].push(_uid);
    _mint(gateway, _uid);
  }

  function tokensOf(address user) external view returns(uint256[]) {
    require(user != address(0x0), "Invalid address passed");
    uint256[] memory ids = new uint256[](tokensOwned[user].length);
    uint256 counter = 0;

    for (uint256 i = 0; i < allTokens.length; i++) {
      if (tokensOwned[user][i] == i+1) {
        ids[counter] = i+1;
        counter++;
      }
    }

    return ids;
  }
}
