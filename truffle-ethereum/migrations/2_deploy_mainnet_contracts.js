const { writeFileSync } = require('fs')

const CryptoCards = artifacts.require('CryptoCards')
const GameToken = artifacts.require('GameToken')
const Gateway = artifacts.require('Gateway') // where is this from? OK, the .sol
const FakeCryptoKitty = artifacts.require('FakeCryptoKitty'); // not .sol?
const NeonDistrictCrafting = artifacts.require('NeonDistrictCrafting');

module.exports = (deployer, _network, accounts) => {

  console.log("truffle eth deploying in _network", _network);
  const [_, user] = accounts
  const validator = accounts[9]  // random

  deployer.deploy(Gateway, [validator], 3, 4).then(async () => {
    const gatewayInstance = await Gateway.deployed()
    let owner = await gatewayInstance.owner();

    console.log("owner", owner);
    console.log(`Gateway deployed at address: ${gatewayInstance.address}`)

    const cryptoCardsContract = await deployer.deploy(CryptoCards, gatewayInstance.address )
    const cryptoCardsInstance = await CryptoCards.deployed()

    const gameTokenContract = await deployer.deploy(GameToken, gatewayInstance.address)
    const gameTokenInstance = await GameToken.deployed()

    const fakeCrytoKittyContract = await deployer.deploy(FakeCryptoKitty, gatewayInstance.address);
    const fakeCrytoKittyInstance = await FakeCryptoKitty.deployed()

    // let's add some crafting! needs a lot of gas to deploy this puppy!
    // gas set to ganache block limit. Not sure why needs so much.
    const NDCraftingContract = await deployer.deploy(NeonDistrictCrafting, {gas:6721975});
    const NDCraftingInstance = await NeonDistrictCrafting.deployed();

    // set gateway
    let gatewaytx = await NDCraftingInstance.setGateway(gatewayInstance.address);
    console.log(`NeonDistrictCrafting deployed at address: ${NDCraftingInstance.address}`)
    console.log(`NeonDistrictCrafting transaction at hash: ${NDCraftingInstance.transactionHash}`)

    console.log(`CryptoCards deployed at address: ${cryptoCardsInstance.address}`)
    console.log(`CryptoCards transaction at hash: ${cryptoCardsContract.transactionHash}`)

    console.log(`GameToken deployed at address: ${gameTokenInstance.address}`)
    console.log(`GameToken transaction at hash: ${gameTokenContract.transactionHash}`)

    console.log(`FakeCryptoKitty deployed at address: ${fakeCrytoKittyInstance.address}`)
    console.log(`FakeCryptoKitty transaction at hash: ${fakeCrytoKittyContract.transactionHash}`)

      // toggleToken lets the gatewayInstance accept tokens from given contract address
    await gatewayInstance.toggleToken(cryptoCardsInstance.address, { from: validator })
    console.log("user", user);
    await cryptoCardsInstance.register(user)
    console.log("the user getting stuff", user);

    await gatewayInstance.toggleToken(gameTokenInstance.address, { from: validator })
    await gameTokenInstance.transfer(user, 100)

    await gatewayInstance.toggleToken(fakeCrytoKittyInstance.address, {from: validator}); // what is this
    await fakeCrytoKittyInstance.register(user); 

    // create an asset type (or two) and mint to the user
    // the gatewayInstance will now accept tokens minted from this contract.
    await gatewayInstance.toggleToken(NDCraftingInstance.address, {from: validator});

    // NOTE: something to note for future devs/future me:
    // * right now I'm minting a hilt on the eth chain (here), to try to move it to the loom chain. 
    // (This is b/c we don't yet know how to start on the loom chain: ultimately we'll mint them on the loom chain
    // and also likely not mint them IN THE MIGRATION FILE.
    // * but in our world, a hilt will likely be made up of component assets (wood, metal, whatever). 
    // so when we transfer a composite asset like that from one chain to the other, 
    // we need to be sure we're transferring all it's composite elements
    // (However we decide to do that. The technical implementation will flow from the game/biz needs)
    // * for now, I'm not going to go down that rabbit hole, but this is an important consideration as the work progresses & develops
      //
      //
    // this nested event watching is not my favorite syntax. Randall -- is there a better way to do this? 
    // not pressing right now b/c minting assets in the migration is just a placeholder
      // to use the UI, etc.  so this code is all in service of this prototype.
    NDCraftingInstance.assetClassCreated().watch ( async (err, response) => {  //set up listener for the AuctionClosed Event
        NDCraftingInstance.NFTMinted().watch( async (err, response) => {
            // this is the id of the SPECIFIC item the user now owns
            let whichNftId = response.args._whichNfi;
            // TBD if writing it out like this (and then reading it in as a BigNumber will work), 
            // will see!
            writeFileSync('../example-nft-whichId', whichNftId);
        })
        // NOTE to self, do I have a typeCounter to typeId mapping in NDCrafting? It would help!
        // this is the specific id of the newly created asset:
        let nftTypeId1 = response.args._typeId;
        writeFileSync('../example-nft-typeId', nftTypeId1);
        try{
            // now let's mint one of these to our user. This way we will be able to see it in the UI.
            // obv. once we build the code to do show it.
            let tx2 = await NDCraftingInstance.mint(nftTypeId1, [user], [1]);
            // i'm going to write this value to a file, so that we can read it later.
        } catch(error) {
            console.log("error", error);
        }
    });
    let tx = await NDCraftingInstance.create("ND Hilt", "some uri", 0,0, "Some Symbol", true);

    writeFileSync('../gateway_address', gatewayInstance.address)
    writeFileSync('../crypto_cards_address', cryptoCardsInstance.address)
    writeFileSync('../crypto_cards_tx_hash', cryptoCardsContract.transactionHash)
    writeFileSync('../game_token_address', gameTokenInstance.address)
    writeFileSync('../game_token_tx_hash', gameTokenContract.transactionHash)
    writeFileSync('../fake_kitty_eth_address', fakeCrytoKittyInstance.address)
    writeFileSync('../fake_kitty_tx_hash', fakeCrytoKittyContract.transactionHash)
    writeFileSync('../nd_eth_address', NDCraftingInstance.address);
    writeFileSync('../nd_tx_hash', NDCraftingContract.transactionHash);

       
  })
}
