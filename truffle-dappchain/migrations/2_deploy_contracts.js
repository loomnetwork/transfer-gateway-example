const { writeFileSync, readFileSync } = require('fs')

const CryptoCardsDappChain = artifacts.require('CryptoCardsDappChain')
const GameTokenDappChain = artifacts.require('GameTokenDappChain')
const FakeLoomCryptoKitty = artifacts.require('FakeLoomCryptoKitty');

module.exports = (deployer, network, accounts) => {
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

    deployer.deploy(FakeLoomCryptoKitty, gatewayAddress).then(async () => {
        const FakeLoomCryptoKittyInstance = await FakeLoomCryptoKitty.deployed();
        console.log(`FakeLoomCryptoKitty deployed at ${FakeLoomCryptoKittyInstance.address}`);
        writeFileSync('../fake_kitty_loom_address', FakeLoomCryptoKittyInstance.address);
    })
}

