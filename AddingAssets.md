# Adding a 721 Asset to Transfer Gateway Example

In this exercise I added a new erc721 asset to the working example in order to understand in a more hands-on way what was going on. This repo is a [fork of the loom transfer gateway implementation repo](https://github.com/loomnetwork/transfer-gateway-example)

In this repo, there are 5 directories:

```bash
├── dappchain
├── truffle-ethereum
├── truffle-dappchain
├── transfer-gateway-scripts
└── webclient
```

In addition, this repo is dependent on a bunch of code in the [loom-js](https://github.com/loomnetwork/loom-js) library.  It's important to remember that some of the code you're working with here is specific to this application, and some of the code is imported from the `loom-js` library. 

## Vocabulary & Terminology
* `loom network` will be referred to as `DappChain` 
* `DappChain` means (more or less) the blockchain where you're playing your game / interacting with your application. The idea is that on the DappChain (the loom network) you can play to your heart's content
and then move assets out (to the ethereum mainnet) or in (_from_ the ethereum mainnet).  

## Resources
* Blog from loom on the [transfer-gateway functionalities](https://loomx.io/developers/docs/en/transfer-gateway.html)
* [Reference implementation of transfer-gateway](https://github.com/loomnetwork/transfer-gateway-example)
* [loom-js](https://github.com/loomnetwork/loom-js) library 

## Application Directories
Salient points. First, the two `truffle-*` directories: 
These are what I think of as the application logic directories. They're more or less mirrors of each other, because each asset you can have on the mainnet, you can have it on the loom chain. Of course, each directory contains logic which blockchain it is running on. 
* `truffle-ethereum` is a directory that runs an ethereum smart-contract app. Its akin to what your entire repo would be if you were just creating something like `CryptoKitties` on the ethereum blockchain. Think: Standalone ethereum app with some extra goodies.
* `truffle-dappchain` is the "mirror version" of the contracts in `truffle-ethereum`. So for each blockchain asset (erc20, erc721, plain 'ol ether) that you have on the mainnet, you have a "mirror" version of that on the loom chain.  Think: parallel universe to the mainnet, with some _different_ extra goodies.

The naming conventions are:
|Eth network|Loom network|
|CryptoCards.sol|CryptoCardsDappChain.sol|
i.e. each ethereum contract is the name of the thing and its loom counterpart is suffixed with `DappChain`.

### So, what other contracts are in the application directories?

1. In `truffle-ethereum`, there's a `Gateway.sol` contract. High-level, this allows for depositing and withdrawing assets to the gateway, which is the intermediary contract between the two networks.
1. In both applications there are standard-fare `ERC721Receiver` etc contracts, which are not different from what you'd find in any other app.

### Short Summary of other dirs
* `transfer-gateway-scripts`. Code to set up mapping between accounts and contracts on the mainnet and the dappchain.  Remember: you can't transfer between two networks if there's not a record of what accounts map to what accounts, what contracts map to what contracts, etc. Without this you just have two non-related apps.
* `dappchain`. Configuration code for the loom network.
* `webclient`. The web UI that demonstrates the functionalities of this application. This is built in React and gives you pages to see and buttons to click that exercise all the code to transfer assets between networks. There's more than UI logic here: there is client-specific application logic that interfaces with the contracts.

#### In short
Two applications (mirror images of each other), gateway code, client-logic, and all-important account and asset mapping logic. 

## 


