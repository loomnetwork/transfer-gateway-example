const { writeFileSync } = require('fs')

const CryptoCards = artifacts.require('CryptoCards')
const Gateway = artifacts.require('Gateway')

module.exports = (deployer, network, accounts) => {
  const [_, user] = accounts
  const validator = accounts[9]
  deployer.deploy(Gateway, [validator], 3, 4).then(async () => {
    const gatewayInstance = await Gateway.deployed()

    console.log(`Gateway deployed at address: ${gatewayInstance.address}`)

    const cryptoCardsContract = await deployer.deploy(CryptoCards, gatewayInstance.address)
    const cryptoCardsInstance = await CryptoCards.deployed()

    console.log(`CryptoCards deployed at address: ${cryptoCardsInstance.address}`)
    console.log(`CryptoCards transaction at hash: ${cryptoCardsContract.transactionHash}`)

    await gatewayInstance.toggleToken(cryptoCardsInstance.address, { from: validator })
    await cryptoCardsInstance.register(user)

    writeFileSync('../gateway_address', gatewayInstance.address)
    writeFileSync('../crypto_cards_address', cryptoCardsInstance.address)
    writeFileSync('../crypto_cards_tx_hash', cryptoCardsContract.transactionHash)
  })
}
