pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

// is this IERC721Receiver now? 
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol";

// huh what's this interface about. ok, mintToGateway
import "./ERC721DAppToken.sol";

contract FakeCryptoKittyDappChain is ERC721DAppToken, ERC721Token, ERC721Receiver{
    address public gatewayContract;

  constructor(address _gatewayContract) ERC721Token("FakeCryptoKittyDappChain", "FLCK") public {
    gatewayContract = _gatewayContract;
  }

  // this is the ERC721DAppToken interface, required
  function mintToGateway(uint256 _uid) public {
    require(msg.sender == gatewayContract);
    _mint(gatewayContract, _uid);
  }

  // also may not need to impl this b/c it's ... in the online contract... from openzep?
  function onERC721Received(
    address _from,
    uint256 _tokenId,
    bytes _data
  ) public returns(bytes4) {
    return ERC721_RECEIVED;
  }
}
