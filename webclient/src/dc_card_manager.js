import Web3 from 'web3'
import BN from 'bn.js'

const {
  NonceTxMiddleware,
  SignedTxMiddleware,
  Client,
  LocalAddress,
  Address,
  CryptoUtils,
  LoomProvider,
  TransferGateway
} = require('loom-js')

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

    // required middleware
    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ]

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

    const transferGateway = await TransferGateway.createAsync(
      client,
      new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
    )

    return new DAppChainCardManager(client, contract, transferGateway)
  }

  constructor(client, contract, transferGateway) {
    this._client = client
    this._contract = contract
    this._transferGateway = transferGateway
  }

  getCardWithId(cardId) {
    return CardList[cardId]
  }

  async getBalanceOfUserAsync(address) {
    return await this._contract.methods.balanceOf(address).call({ from: address })
  }

  async getTokensCardsOfUserAsync(address, balance) {
    const total = await this._contract.methods.totalSupply().call()
    let ids = []
    for (let i = 0; i < total; i++) {
      if (i >= balance) {
        break
      }

      const cardId = await this._contract.methods
        .tokenOfOwnerByIndex(address, i)
        .call({ from: address })

      if (cardId !== 0) {
        ids.push(cardId)
      }
    }

    return ids
  }

  async approveAsync(address, cardId) {
    return await this._contract.methods
      .approve('0xb9fA0896573A89cF4065c43563C069b3B3C15c37'.toUpperCase(), cardId)
      .send({ from: address })
  }

  async withdrawCardAsync(cardId) {
    return await this._transferGateway.withdrawERC721Async(
      new BN(cardId),
      new Address(this._client.chainId, LocalAddress.fromHexString(this._contract.options.address))
    )
  }

  async withdrawalReceiptAsync(address) {
    return await this._transferGateway.withdrawalReceiptAsync(
      new Address(this._client.chainId, LocalAddress.fromHexString(address))
    )
  }
}
