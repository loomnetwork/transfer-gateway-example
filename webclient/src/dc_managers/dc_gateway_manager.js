import BN from 'bn.js'

import {
  Contracts,
  CryptoUtils,
  Client,
  NonceTxMiddleware,
  SignedTxMiddleware,
  Address,
  LocalAddress
} from 'loom-js/dist'

export default class DAppChainGatewayManager {
  static async createAsync() {
    const privateKey = CryptoUtils.B64ToUint8Array(
      'ZGTsP8LUJkEWiqEZq3hqOKfCHCeV+CbYgbZK2/y53aDAaCJPBla4uLTsEtzm/Dczk8Ml8TL5+rAwKNfbuRZihg=='
    )

    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)

    const client = new Client(
      'default',
      'ws://127.0.0.1:46658/websocket',
      'ws://127.0.0.1:46658/queryws'
    )

    // required middleware
    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ]

    const transferGateway = await Contracts.TransferGateway.createAsync(
      client,
      new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
    )

    return new DAppChainGatewayManager(transferGateway, client)
  }

  constructor(transferGateway, client) {
    this._transferGateway = transferGateway
    this._client = client

    this._transferGateway.on(Contracts.TransferGateway.EVENT_TOKEN_WITHDRAWAL, event => {
      if (this._onTokenWithdrawal) {
        this._onTokenWithdrawal(event)
      }
    })
  }

  onTokenWithdrawal(fn) {
    this._onTokenWithdrawal = fn
  }

  async withdrawCardAsync(cardId, contractAddress) {
    return await this._transferGateway.withdrawERC721Async(
      new BN(cardId),
      new Address(this._client.chainId, LocalAddress.fromHexString(contractAddress))
    )
  }

  async withdrawTokenAsync(amount, contractAddress) {
    return await this._transferGateway.withdrawERC20Async(
      new BN(amount),
      new Address(this._client.chainId, LocalAddress.fromHexString(contractAddress))
    )
  }

  async withdrawalReceiptAsync(address) {
    return await this._transferGateway.withdrawalReceiptAsync(
      new Address(this._client.chainId, LocalAddress.fromHexString(address))
    )
  }

  async withdrawEthAsync(amount) {
    return await this._transferGateway.withdrawETHAsync(
      new BN(amount),
      new Address(
        this._client.chainId,
        LocalAddress.fromHexString('0xf5cAD0DB6415a71a5BC67403c87B56b629b4DdaA')
      )
    )
  }
}
