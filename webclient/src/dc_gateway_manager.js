import BN from 'bn.js'

import {
  TransferGateway,
  CryptoUtils,
  Client,
  NonceTxMiddleware,
  SignedTxMiddleware,
  Address,
  LocalAddress
} from 'loom-js'

export default class DAppChainGatewayManager {
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

    const transferGateway = await TransferGateway.createAsync(
      client,
      new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
    )

    return new DAppChainGatewayManager(transferGateway, client)
  }

  constructor(transferGateway, client) {
    this._transferGateway = transferGateway
    this._client = client

    this._transferGateway.on(TransferGateway.EVENT_TOKEN_WITHDRAWAL, event => {
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

  async withdrawalReceiptAsync(address) {
    return await this._transferGateway.withdrawalReceiptAsync(
      new Address(this._client.chainId, LocalAddress.fromHexString(address))
    )
  }
}
