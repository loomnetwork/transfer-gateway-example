const { writeFileSync } = require('fs')

const CryptoCards = artifacts.require('CryptoCards')
const GameToken = artifacts.require('GameToken')
const Gateway = artifacts.require('Gateway')

module.exports = (deployer, _network, accounts) => {
  const [_, user] = accounts
  const validator = accounts[9]
  deployer.deploy(Gateway, [validator], 3, 4).then(async () => {
    const gatewayInstance = await Gateway.deployed()

    console.log(`Gateway deployed at address: ${gatewayInstance.address}`)

    const cryptoCardsContract = await deployer.deploy(CryptoCards, gatewayInstance.address)
    const cryptoCardsInstance = await CryptoCards.deployed()

    const gameTokenContract = await deployer.deploy(GameToken, gatewayInstance.address)
    const gameTokenInstance = await GameToken.deployed()

    console.log(`CryptoCards deployed at address: ${cryptoCardsInstance.address}`)
    console.log(`CryptoCards transaction at hash: ${cryptoCardsContract.transactionHash}`)

    console.log(`GameToken deployed at address: ${gameTokenInstance.address}`)
    console.log(`GameToken transaction at hash: ${gameTokenContract.transactionHash}`)

    await gatewayInstance.toggleToken(cryptoCardsInstance.address, { from: validator })
    await cryptoCardsInstance.register(user)

    await gatewayInstance.toggleToken(gameTokenInstance.address, { from: validator })
    await gameTokenInstance.transfer(user, 100)

    writeFileSync('../gateway_address', gatewayInstance.address)
    writeFileSync('../crypto_cards_address', cryptoCardsInstance.address)
    writeFileSync('../crypto_cards_tx_hash', cryptoCardsContract.transactionHash)
    writeFileSync('../game_token_address', gameTokenInstance.address)
    writeFileSync('../game_token_tx_hash', gameTokenContract.transactionHash)
  })
}
