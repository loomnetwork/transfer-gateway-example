const { writeFileSync, readFileSync } = require('fs')

const CryptoCardsDappChain = artifacts.require('CryptoCardsDappChain')
const GameTokenDappChain = artifacts.require('GameTokenDappChain')
const FakeCryptoKittyDappChain = artifacts.require('FakeCryptoKittyDappChain');
const NeonDistrictCraftingDappChain = artifacts.require('NeonDistrictCraftingDappChain');

module.exports = (deployer, network, accounts) => {
    console.log("deploying to loom network", network);
    // remind me where did this come from? it's not the solidity gateway
    // and its part of the repo...
  const gatewayAddress = readFileSync('../gateway_dappchain_address', 'utf-8')

    // 
  deployer.deploy(CryptoCardsDappChain, gatewayAddress).then(async () => {
    const cryptoCardsDAppChainInstance = await CryptoCardsDappChain.deployed()
    console.log(`CryptoCardsDAppChain deployed at address: ${cryptoCardsDAppChainInstance.address}`)
    writeFileSync('../crypto_cards_dappchain_address', cryptoCardsDAppChainInstance.address)
  })

  deployer.deploy(GameTokenDappChain, gatewayAddress).then(async () => {
    const GameTokenDappChainInstance = await GameTokenDappChain.deployed()
    console.log(`GameTokenDappChain deployed at address: ${GameTokenDappChainInstance.address}`)
    writeFileSync('../game_token_dappchain_address', GameTokenDappChainInstance.address)
  })

    deployer.deploy(FakeCryptoKittyDappChain, gatewayAddress).then(async () => {
        const FakeCryptoKittyDappChainInstance = await FakeCryptoKittyDappChain.deployed();
        console.log(`FakeCryptoKittyDappChain deployed at ${FakeCryptoKittyDappChainInstance.address}`);
        writeFileSync('../fake_kitty_loom_address', FakeCryptoKittyDappChainInstance.address);
    })

    deployer.deploy(NeonDistrictCraftingDappChain).then(async() => {
        const NeonDistrictCraftingDappChainInstance = await NeonDistrictCraftingDappChain.deployed();
        console.log(`NeonDistrictCraftingDappChain deployed at ${NeonDistrictCraftingDappChainInstance.address}`);
        let tx = await NeonDistrictCraftingDappChainInstance.setGateway(gatewayAddress);
        console.log("gateway should be set", tx);
        writeFileSync('../nd_dappchain_address', NeonDistrictCraftingDappChainInstance.address);
    })
}

