import Web3 from 'web3'
import BN from 'bn.js'

const {
  NonceTxMiddleware,
  SignedTxMiddleware,
  Client,
  Address,
  LocalAddress,
  CryptoUtils,
  Contracts,
  Web3Signer
} = require('loom-js/dist')

export default class DAppChainAccountManager {
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

    client.on('error', data => {
      console.error(data)
    })

    // required middleware
    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ]

    const addressMapper = await Contracts.AddressMapper.createAsync(
      client,
      new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
    )

    const ethCoin = await Contracts.EthCoin.createAsync(
      client,
      new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
    )

    return new DAppChainAccountManager(client, publicKey, addressMapper, ethCoin)
  }

  constructor(client, publicKey, addressMapper, ethCoin) {
    this._client = client
    this._publicKey = publicKey
    this._addressMapper = addressMapper
    this._ethCoin = ethCoin
  }

  getCurrentAccount() {
    return LocalAddress.fromPublicKey(this._publicKey).toString()
  }

  async getAddressMappingAsync(ethAddress) {
    try {
      const from = new Address('eth', LocalAddress.fromHexString(ethAddress))
      return await this._addressMapper.getMappingAsync(from)
    } catch (_) {
      return null
    }
  }

  async signAsync(ethAddress) {
    const from = new Address('eth', LocalAddress.fromHexString(ethAddress))
    const to = new Address(this._client.chainId, LocalAddress.fromPublicKey(this._publicKey))

    const web3 = new Web3(window.web3.currentProvider)
    const web3Signer = new Web3Signer(web3, ethAddress)
    return await this._addressMapper.addIdentityMappingAsync(from, to, web3Signer)
  }

  async approveAsync(amount) {
    return await this._ethCoin.approveAsync(
      new Address(
        this._client.chainId,
        LocalAddress.fromHexString('0xC5d1847a03dA59407F27f8FE7981D240bff2dfD3')
      ),
      new BN(amount)
    )
  }

  async getEthCoinBalance() {
    const address = new Address(this._client.chainId, LocalAddress.fromPublicKey(this._publicKey))
    return await this._ethCoin.getBalanceOfAsync(address)
  }
}
