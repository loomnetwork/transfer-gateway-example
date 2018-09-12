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
## Before we start
This is a reference implementation repo.  It's helpful in that it demonstrates how to move assets between chains. But for creating your own loom-ethereum transfer repo, you will probably want to either refactor heavily, start from scratch, do the same things in ways that are more suited to your organization, etc.  Let this repo help you but don't feel like you have to use it, or use React, or set up code just how it's setup here.
## Vocabulary & Terminology
* `loom network` will be referred to as `DappChain` 
* `DappChain` means (more or less) the blockchain where you're playing your game / interacting with your application. The idea is that on the DappChain (the loom network) you can play to your heart's content and then move assets out (to the ethereum mainnet) or in (_from_ the ethereum mainnet).  
* `mainnet` refers to your running ethereum network, not just literally the ethereum mainnet.
## Resources
* Blog from loom on the [transfer-gateway functionalities](https://loomx.io/developers/docs/en/transfer-gateway.html)
* [Reference implementation of transfer-gateway](https://github.com/loomnetwork/transfer-gateway-example)
* [loom-js](https://github.com/loomnetwork/loom-js) library 

## Application Directories
Salient points. First, the two `truffle-*` directories: 
These are what I think of as the application logic directories. They're more or less mirrors of each other, because each asset you can have on the mainnet, you can have it on the loom chain. Of course, each directory contains logic which blockchain it is running on. 
* `truffle-ethereum` is a directory that runs an ethereum smart-contract app. Its akin to what your entire repo would be if you were just creating something like `CryptoKitties` on the ethereum blockchain. Think: Standalone ethereum app with some extra goodies.
* `truffle-dappchain` is the "mirror version" of the contracts in `truffle-ethereum`. So for each blockchain asset (erc20, erc721) that you have on the mainnet, you have a "mirror" version of that on the loom chain.  Think: parallel universe to the mainnet, with some _different_ extra goodies.

The naming conventions are:

| Eth Network  | Loom Network |
| ------------- | ------------- |
| CryptoCards.sol| CryptoCardsDappChain.sol |
| FakeCryptoKitty.sol| FakeCryptoKittyDappChain.sol |

i.e. each ethereum contract is the name of the thing and its loom counterpart is suffixed with `DappChain`. To illustrate, `MySoul.sol` and `MySoulDappChain.sol` would allow me to transfer my soul across blockchains. These naming conventions are not set in stone, but it's good to have some kind of naming convention and this is what they picked for this repo.

### So, what other contracts are in the application directories?

1. In `truffle-ethereum`, there's a `Gateway.sol` contract. High-level, this allows for depositing and withdrawing assets to the gateway, which is the intermediary contract between the two networks.
1. In both applications there are standard-fare `ERC721Receiver` etc contracts, which are not much different from what you'd find in any other app.

### Short Summary of other dirs
* `transfer-gateway-scripts`. Code to set up mapping between accounts and contracts on the mainnet and the dappchain.  Remember: you can't transfer between two networks if there's not a record of what accounts map to what accounts, what contracts map to what contracts, etc. Without this you just have two non-related apps.
* `dappchain`. Configuration code for the loom network.
* `webclient`. The web UI that demonstrates the functionalities of this application. This is built in React and gives you pages to see and buttons to click that exercise all the code to transfer assets between networks. There's more than UI logic here: there is client-specific application logic that interfaces with the contracts.

### In short
Two applications (mirror images of each other), gateway code, client-logic, and all-important account and asset mapping logic. 

## Setting up
There's a `transfer_gateway` script with a bunch of commands to get the app up and running. Read through this file & see what each one does, but here are the cliff notes:
* `./transfer_gateway cleanup` deletes all the `node_modules` 
* `./transfer_gateway setup` installs everything in `package.json` using `yarn`. This is what you run after cleanup or on a fresh install.
* `./transfer_gateway stop` stops all the running services
* `./transfer_gateway start` is the big one. Understand what this is doing, b/c it's the glue that holds the application together. Here goes.

### `./transfer_gateway start`

Does this: 
```
start_and_deploy_truffle_ethereum   # regular 'ol deploy contracts & start ganache
start_dappchain                     # dappchain is loom; starts loom blockchain
deploy_truffle_dappchain            # dappchain is loom; deploys the loom contracts on the loom chain
start_webapp                        # react app; starts it up on 8080
run_mapping                         # maps things. very important. keep reading.
```

#### run_mapping

`run_mapping` is the most important command to understand here. This is where connections are made between the assets on the ethereum chain, and their partner assets on the loom chain. If my ethereum asset `CryptoCards` was *not* mapped to its counterpart `CryptoCardsDappChain` on the loom chain, we would not know that you can transfer these back and forth between chains. Since the whole project is about transferring assets between chains, the mapping step is critical. 

In addition, this step has to be run _after_ the contracts are deployed to their respective chains because in the deploy step we're writing their addresses out to files, so that the addresses can be used in the mapping. If you did not have the addresses of the contracts to map... well, you see the problem. And not only do we need the addresses of the deployed contracts, we need the transaction hash from deploying the contract to the ethereum chain.  So if you'll take a quick seque and look in the migrations files for the `truffle-*` directories, you'll see that in addition to deploying contracts, we're writing this data to files that we can use later. However you do this (write to files, store elsewhere), you need to get this information out of the migrations step so you can use it in the mappings step.

Each asset that gets mapped has, in this repo, it's own javascript file that gets run by node. You can find these in the 
```
./transfer-gateway-scripts/
```
directory. 

Let's look at `transfer-gateway-scripts/mapping_crypto_cards.js` as its a good example. The first thing it does, after including a bunch of `node` and `loom-js` packages is to read from those files we wrote during our migrations. This file then uses that information, plus the private key of the deployer, to build a loom client, a `transferGateway` object, other objects... all to eventually run this code, which creates the mapping:
```
  await transferGateway.addContractMappingAsync({
    foreignContract,
    localContract,
    foreignContractCreatorSig,
    foreignContractCreatorTxHash
  })
``` 
This code is leveraging your contract addresses and deployer keys to [run this code](https://github.com/loomnetwork/loom-js/blob/f0df59fc58e1a15f7bfeee96565d8d828e335796/src/contracts/transfer-gateway.ts#L103) in the `loom-js` package. There's a mapping file for each of the assets in the repository: they mostly do the same things, so this is an opportunity for refactoring, moving forwards. 

These mapping scripts implement [the logic described here](https://loomx.io/developers/docs/en/transfer-gateway.html#mapping-mainnet-contracts-to-dappchain-contracts).  

I'll leave by saying *mapping is important*. And also, [that code I linked to above?](https://github.com/loomnetwork/loom-js/blob/f0df59fc58e1a15f7bfeee96565d8d828e335796/src/contracts/transfer-gateway.ts#L103-L107) Note that its arguments are keyed, so if you try renaming them (like I did&mdash;for "clarity"), the function won't work :)

## Migrations
Before we go to localhost:8080, let's talk about migrations. Read each of the migrations files in the `truffle-*` directories. Notice the following: 

### Ethereum Migrations
* The Ethereum Gateway contract (`Gateway.sol` is deployed first). So that its address can be passed to the other contracts. Otherwise, there's no known gateway, and how do you transfer.
* The "regular contracts" get deployed next, and they're assigned to instance variables _because we need them later_.
* There's something about `toggleToken` on the gateway that I do not yet understand enough to explain to you.
* Then, b/c this is a demo app, we give some tokens to the user so there's something to do in the UI. You can see this happening in the `register` functions called on the contract instances.  Bonus points: figure out how these work.
* Write out the data that we need later: addresses & tx hashes.


### Loom Migrations
* Right away you can see that this is a little different b/c we already have the gateway dappchain address because it is [literally included in the repo](https://github.com/loomnetwork/transfer-gateway-example/blob/master/gateway_dappchain_address). The other addresses are _not_ included in the repo, so this is something that when you're not using the reference implementation repo, you will need to get else-ways. 

* So in this case, we read that address, deploy each of the loom contracts with that address (they also need to know the gateway!) and then write their addresses out for later use.  

So by the end of migration, you have a bunch of important data files written out, also you've given your user some basic assets. 

## Grokking the UI
Go to the browser, which should be running at 8080. You need to have metamask running and also have imported the account that [is detailed in the README](./README.md).   You'll want to get familiar with the `webclient/src` directory: 
```
components/
dc_managers/
eth_managers/
index.js
```
The most important thing to grok here imo is that the `dc_managers` and `eth_managers` dirs contain classes that are thin wrappers around `web3`, the ethereum contracts in the repo, the gateway contract, and the loom contracts in the repo. And like everything else, each file in the `eth_managers` directory has a counterpart in the `dc_managers` directory.

The `components` contains React components (views) that call methods that are defined (for the most part) in classes in the `*_managers` dirs.

There's a `dappchain_tokens` view, a `gateway_tokens` view and an `eth_tokens` view: these determine what you see when you click on those tabs in the UI. So to track the application flow, you can start in those files.

## Transferring assets 
### Eth -> Loom
Let's transfer an asset from eth -> loom and back, walking through the code calls.

So you're in your UI, clicking the "send to DappChain" button on a card defined in `eth_tokens.js` calls
```
this.sendToDAppChainCard(id)
```
which calls (defined in that same file, note the `this`)
```
this.props.ethCardManager.depositCardOnGateway(account, id)
```
which takes you to the `eth_card_manager.js` file where as you can see, 
```
depositCardOnGateway
```
 is defined, and is simply a thin wrapper around the 
```
CryptoCards#depositCardOnGateway method
``` 

which itself just calls 
```
safeTransferFrom
``` 
which is part of the `ERC721` standard. So all this is just layers of indirection around transferring a token between contracts. Which, [as you can see here](https://loomx.io/developers/docs/en/transfer-gateway.html#overview) facilitates a transfer to the Gateway contract.

And bingo, your UI will update because in `dappchain_tokens` the code starts by checking the `cardBalance`, then, if it's greater than 0, populates `cardIds` like so:

```
cardIds = await this.props.dcCardManager.getTokensCardsOfUserAsync(account, cardBalance)

```
And what is `getTokensCardsOfUserAsync`? Well, just some wrappers around contract methods like `totalSupply()` and `tokenOfOwnerByIndex`, which are just plain 'ol 721 methods our contract is inheriting from.

### Loom -> Eth
So let's bring it back. You're looking at the UI under `DappChain Account` and see your own card with an `Allow Withdraw` button.  Clicking this calls:

```
this.allowToWithdrawCard(cardId)
```
in the `dappchain_tokens` file, which which calls
```
this.props.dcCardManager.approveAsync(account, cardId)
```
which does some trippy stuff with `iban` and checksum  but at the root of it calls
```
approve(addr,id)
```
on the CryptoCardsDappChain contract, which is a method from `ERC721` which sets withdraw approval.  

What does ERC721 approval do? It says: the address I'm specifying here has permission to withdraw the tokenId I am specifying. Which address are we sending? We (the token owner) are giving the gateway contract approval to withdraw this token. 

If you look at [this diagram](https://loomx.io/developers/docs/en/transfer-gateway.html) you'll see this is what is happening in step #3. If you need a refresher on ERC721, [this is a good breakdown](https://medium.com/blockchannel/walking-through-the-erc721-full-implementation-72ad72735f3c).

Right after `approveAsync` is called and completes, the gateway tries to withdraw the token:
```
this.props.dcGatewayManager.withdrawCardAsync(cardId, dcCardManager.getContractAddress())
```
This method -- on the `dc_gateway_manager` file, calls through to [some `loom-js` code](https://github.com/loomnetwork/loom-js/blob/f0df59fc58e1a15f7bfeee96565d8d828e335796/src/contracts/transfer-gateway.ts#L125-L131): 
```
transferGateway.withdrawERC721Async(BN(cardId), Address(chainId, contractAddress)
```

OK. So at this point (after clicking through some success alerts), the card will no longer be visible in the DApp portion of the UI, but it _will_ be visible in the `Ethereum Gateway` portion of the UI under the `ERC721` tab.  Now it has a big blue button that says... "Withdraw from Gateway".

The logic for this functionality will be in... `components/gateway_tokens.js`... because.. the card is now in the gateway. Clicking the blue button calls
```
this.withdrawFromGatewayCard(cardId)

```
which in turn calls
```
this.props.dcGatewayManager.withdrawalReceiptAsync(this.state.account)
```
which calls out to [some loom code](https://github.com/loomnetwork/loom-js/blob/f0df59fc58e1a15f7bfeee96565d8d828e335796/src/contracts/transfer-gateway.ts#L149-L173). 

When that completes, it returns a bunch of important info: namely the `tokenOwner` and the `oracleSignature`, which is then used to call
```
await this.props.ethGatewayManager.withdrawCardAsync(
    tokenOwner,
    cardId,
    signature,
    this.props.ethCardManager.getContractAddress()
)
```
which wraps the `withdrawERC721` method on our very own `Gateway.sol` contract. This method, as you can [see in our own codebase](https://github.com/loomnetwork/transfer-gateway-example/blob/master/truffle-ethereum/contracts/Gateway.sol#L69-L77), does some validation checks which I'm glossing over here, but you can _also_ see in [our own (forked) codebase](https://github.com/loomnetwork/transfer-gateway-example/blob/master/truffle-ethereum/contracts/ValidatorManagerContract.sol#L38-L48) and then wraps some basic ERC721 transfer logic.

### this.props
If you're wondering about `this.props`, check out `webclient/index.js` where you'll see all of the components being initialized with the correct set of `dc_managers` and `eth_managers`.

## Summary
The goal of this doc is to give a path through the code base so you can follow the thread from reading, and then use it to dig more into the codebase.  I'll add to it and make it more clear, but for me there was a gap between the conceptual "what was happening" and the literal code paths and organization of _how it was happening_. 





