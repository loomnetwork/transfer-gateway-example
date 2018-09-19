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
    // set to ganache block limit
    const NDCraftingContract = await deployer.deploy(NeonDistrictCrafting, {gas:6721975});
    const NDCraftingInstance = await NeonDistrictCrafting.deployed();

    // set gateway
    let gatewaytx = await NDCraftingInstance.setGateway(gatewayInstance.address);
    console.log("gatewaytx", gatewaytx);
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

    await gatewayInstance.toggleToken(NDCraftingInstance.address, {from: validator});

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
