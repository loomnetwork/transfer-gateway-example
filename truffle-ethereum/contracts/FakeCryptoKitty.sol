pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract FakeCryptoKitty is ERC721Token("FakeCryptoKitty", "FCK"), Ownable {
    address public gatewayContract;
    constructor (address _gatewayContract) public{
        gatewayContract = _gatewayContract;
    }

      function depositToGateway(uint tokenId) public {
        safeTransferFrom(msg.sender, gatewayContract, tokenId);
      }

    // only useful for demo purposes, but let's mint some so they're visible in a UI
    function register(address user) onlyOwner external{
        for(uint8 i= 0; i < 2; i++){
            // give each user 2 fake cats
            mintFor(user);
        }
    }

    function mintFor(address user) private {
        uint256 tokenId = allTokens.length + 1;
        _mint(user, tokenId);
    }

}
