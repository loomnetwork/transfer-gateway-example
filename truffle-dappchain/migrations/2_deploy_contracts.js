const { readFileSync } = require('fs')

const CryptoCardsDappChain = artifacts.require('CryptoCardsDappChain')

module.exports = (deployer, network, accounts) => {
  const gatewayAddress = '0xb9fA0896573A89cF4065c43563C069b3B3C15c37'
  const cryptoCardsAddress = readFileSync('../crypto_cards_address', 'utf-8')

  deployer.deploy(CryptoCardsDappChain, gatewayAddress)
    .then(async () => {
      const {
        NonceTxMiddleware, SignedTxMiddleware, Client, Address,
        LocalAddress, CryptoUtils, AddressMapper, createJSONRPCClient
      } = require('loom-js')

      const privateKey = CryptoUtils.B64ToUint8Array(readFileSync('../dappchain/private_key', 'utf-8'))
      const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)

      const chainId  = 'default'
      const writeUrl = 'http://127.0.0.1:46658/rpc'
      const readUrl  = 'http://127.0.0.1:46658/query'

      const writer = createJSONRPCClient({ protocols: [{ url: writeUrl }] })
      const reader = createJSONRPCClient({ protocols: [{ url: readUrl }] })
      const client = new Client(chainId, writer, reader)

      // required middleware
      client.txMiddleware = [
        new NonceTxMiddleware(publicKey, client),
        new SignedTxMiddleware(privateKey)
      ]

      const addressMapper = await AddressMapper.createAsync(
        client,
        new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
      )

      const cryptoCardsDappChainInstance = await CryptoCardsDappChain.deployed()

      const from = new Address('eth', LocalAddress.fromHexString(cryptoCardsAddress))
      const to = new Address(client.chainId, LocalAddress.fromHexString(cryptoCardsDappChainInstance.address))

      await addressMapper.addContractMappingAsync(from, to)
    })
}
