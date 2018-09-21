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

    // NOTE. An important point for this code (register)
    // When you view the app in the UI, you see the cards, and each
    // card has a name & a description. Notice those aren't
    // assigned when minting a card here. That's actually
    // a "sleight-of-hand" by the repo, probably to keep the 
    // example code simple.  
      
    // What's happening is you mint
    // n of these things, and then in the view function, 
    // the code looks up which card description & title go with each n
    // It gets this data from the .js file 
    // webclient/src/card_list.js
    // so, description 1 goes with the first card minted, etc.
    // rather than having the name & title be part of the actual
    // 721 itself.  
      
    // If this was a real implementation, the metadata
    // would be created with the 721 itself. 

    // only useful for demo purposes, but let's mint some so they're visible in a UI
    function register(address user) onlyOwner external{
        for(uint8 i= 0; i < 1; i++){
            // give each user 1 fake cat
            mintFor(user);
        }
    }

    function mintFor(address user) private {
        uint256 tokenId = allTokens.length + 1;
        _mint(user, tokenId);
    }

}
