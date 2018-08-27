pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

/**
 * @title ERC721 interface for token contracts deployed to Loom DAppChains.
 */
contract ERC721DAppToken is ERC721 {
    // Called by the DAppChain Gateway contract to mint tokens that have been deposited to the
    // Mainnet gateway.
    //
    // NOTE: This function will only be called by the DAppChain Gateway contract if it doesn't own
    // the token it needs to transfer, so it's possible to omit this function if you wish to
    // manually allocate tokens for the Gateway.
    function mintToGateway(uint256 _uid) public;
}