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
  constructor(address _gateway) ERC721Token("CryptoCardsDappChain", "CRC") public {
    gateway = _gateway;
  }

  // Called by the gateway contract to mint tokens that have been deposited to the Mainnet gateway.
  function mint(uint256 _uid) public {
    require(msg.sender == gateway);
    _mint(gateway, _uid);
  }

  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes _data
  )
    public
  {
    tokensOwned[_to].push(_tokenId);
    // solium-disable-next-line arg-overflow
    super.safeTransferFrom(_from, _to, _tokenId, _data);
  }

  function tokensOf(address user) external view returns(uint256[]) {
    require(user != address(0x0), "Invalid address passed");
    uint256[] memory ids = tokensOwned[user];
    return ids;
  }
}
