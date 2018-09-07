const { writeFileSync } = require('fs')

const CryptoCards = artifacts.require('CryptoCards')
const GameToken = artifacts.require('GameToken')
const Gateway = artifacts.require('Gateway') // where is this from? OK, the .sol
const FakeCryptoKitty = artifacts.require('FakeCryptoKitty'); // not .sol?

module.exports = (deployer, _network, accounts) => {
  const [_, user] = accounts
  const validator = accounts[9]  // random

  deployer.deploy(Gateway, [validator], 3, 4).then(async () => {
    const gatewayInstance = await Gateway.deployed()

    console.log(`Gateway deployed at address: ${gatewayInstance.address}`)

    const cryptoCardsContract = await deployer.deploy(CryptoCards, gatewayInstance.address)
    const cryptoCardsInstance = await CryptoCards.deployed()

    const gameTokenContract = await deployer.deploy(GameToken, gatewayInstance.address)
    const gameTokenInstance = await GameToken.deployed()

    const fakeCrytoKittyContract = await deployer.deploy(FakeCryptoKitty, gatewayInstance.address);
      const fakeCrytoKittyInstance = await FakeCryptoKitty.deployed()

    console.log(`CryptoCards deployed at address: ${cryptoCardsInstance.address}`)
    console.log(`CryptoCards transaction at hash: ${cryptoCardsContract.transactionHash}`)

    console.log(`GameToken deployed at address: ${gameTokenInstance.address}`)
    console.log(`GameToken transaction at hash: ${gameTokenContract.transactionHash}`)

    console.log(`FakeCryptoKitty deployed at address: ${fakeCrytoKittyInstance.address}`)
    console.log(`FakeCryptoKitty transaction at hash: ${fakeCrytoKittyContract.transactionHash}`)

      // i don't understand the why here with toggleToken
      //
        //function toggleToken(address _token) public onlyValidator {
            //allowedTokens[_token] = !allowedTokens[_token];
        //}

      // BUT this is where we mint the things to the person
    await gatewayInstance.toggleToken(cryptoCardsInstance.address, { from: validator })
    await cryptoCardsInstance.register(user)
      console.log("the user getting stuff", user);

    await gatewayInstance.toggleToken(gameTokenInstance.address, { from: validator })
    await gameTokenInstance.transfer(user, 100)

      await gatewayInstance.toggleToken(fakeCrytoKittyInstance.address, {from: validator}); // what is this
      await fakeCrytoKittyInstance.register(user); 

    writeFileSync('../gateway_address', gatewayInstance.address)
    writeFileSync('../crypto_cards_address', cryptoCardsInstance.address)
    writeFileSync('../crypto_cards_tx_hash', cryptoCardsContract.transactionHash)
    writeFileSync('../game_token_address', gameTokenInstance.address)
    writeFileSync('../game_token_tx_hash', gameTokenContract.transactionHash)
      writeFileSync('../fake_kitty_eth_address', fakeCrytoKittyInstance.address)
      writeFileSync('../fake_kitty_tx_hash', fakeCrytoKittyContract.transactionHash)
  })
}
