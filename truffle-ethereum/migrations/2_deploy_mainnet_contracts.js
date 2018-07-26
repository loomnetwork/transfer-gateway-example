const { writeFileSync } = require('fs')

const CryptoCards = artifacts.require('CryptoCards')
const Gateway = artifacts.require('Gateway')

module.exports = (deployer, network, accounts) => {
  const [owner, user] = accounts
  deployer.deploy(Gateway, [accounts[9]], 3, 4).then(async () => {
    const gatewayInstance = await Gateway.deployed()
    writeFileSync('../gateway_address', gatewayInstance.address)
    console.log(`Gateway deployed at address: ${gatewayInstance.address}`)

    await deployer.deploy(CryptoCards, gatewayInstance.address)
    const cryptoCardsInstance = await CryptoCards.deployed()
    writeFileSync('../crypto_cards_address', cryptoCardsInstance.address)
    console.log(`CryptoCards deployed at address: ${cryptoCardsInstance.address}`)

    await gatewayInstance.toggleToken(cryptoCardsInstance.address, { from: accounts[9] })
    await cryptoCardsInstance.register(user)
  })
}
