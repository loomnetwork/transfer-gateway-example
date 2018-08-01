import Web3 from 'web3'

const { Client, LocalAddress, CryptoUtils, LoomProvider } = require('loom-js')

import CardList from './card_list'

export default class DAppChainCardManager {
  static async createAsync() {
    const privateKey = CryptoUtils.B64ToUint8Array(
      'ZGTsP8LUJkEWiqEZq3hqOKfCHCeV+CbYgbZK2/y53aDAaCJPBla4uLTsEtzm/Dczk8Ml8TL5+rAwKNfbuRZihg=='
    )

    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)

    const client = new Client(
      'default',
      'ws://127.0.0.1:46657/websocket',
      'ws://127.0.0.1:9999/queryws'
    )

    const from = LocalAddress.fromPublicKey(publicKey).toString()
    const web3 = new Web3(new LoomProvider(client, privateKey))

    const networkId = await web3.eth.net.getId()

    client.on('error', msg => {
      console.error('Error on connect to client', msg)
      console.warn('Please verify if loom command is running')
    })

    const contract = new web3.eth.Contract(
      DC_CRYPTO_CARDS_JSON.abi,
      DC_CRYPTO_CARDS_JSON.networks[networkId].address,
      { from }
    )

    return new DAppChainCardManager(contract)
  }

  constructor(contract) {
    this.contract = contract
  }

  getCardWithId(cardId) {
    return CardList[cardId]
  }

  async getBalanceOfUserAsync(address) {
    return await this.contract.methods.balanceOf(address).call({ from: address })
  }

  async getTokensCardsOfUserAsync(address) {
    return await this.contract.methods.tokensOf(address).call({ from: address })
  }

  async depositCardOnGateway(address, cardId) {
    return await this.contract.methods.depositToGateway(cardId).send({ from: address })
  }
}
