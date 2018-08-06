const { writeFileSync, readFileSync } = require('fs')

const CryptoCardsDappChain = artifacts.require('CryptoCardsDappChain')

module.exports = (deployer, network, accounts) => {
  const gatewayAddress = readFileSync('../gateway_dappchain_address', 'utf-8')

  deployer.deploy(CryptoCardsDappChain, gatewayAddress).then(async () => {
    const cryptoCardsDAppChainInstance = await CryptoCardsDappChain.deployed()
    console.log(`CryptoCardsDAppChain deployed at address: ${cryptoCardsDAppChainInstance.address}`)
    writeFileSync('../crypto_cards_dappchain_address', cryptoCardsDAppChainInstance.address)
  })
}
