import Web3 from 'web3'

const {
  NonceTxMiddleware,
  SignedTxMiddleware,
  Client,
  Address,
  LocalAddress,
  CryptoUtils,
  AddressMapper,
  Web3Signer
} = require('loom-js')

export default class DAppChainAccountManager {
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

    const addressMapper = await AddressMapper.createAsync(
      client,
      new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
    )

    return new DAppChainAccountManager(client, publicKey, addressMapper)
  }

  constructor(client, publicKey, addressMapper) {
    this.client = client
    this.publicKey = publicKey
    this.addressMapper = addressMapper
  }

  getCurrentAccount() {
    return LocalAddress.fromPublicKey(this.publicKey).toString()
  }

  async getAddressMappingAsync(ethAddress) {
    try {
      const from = new Address('eth', LocalAddress.fromHexString(ethAddress))
      return await this.addressMapper.getMappingAsync(from)
    } catch (_) {
      return null
    }
  }

  async signAsync(ethAddress) {
    const from = new Address('eth', LocalAddress.fromHexString(ethAddress))
    const to = new Address(this.client.chainId, LocalAddress.fromPublicKey(this.publicKey))

    const web3 = new Web3(window.web3.currentProvider)
    const web3Signer = new Web3Signer(web3, ethAddress)
    return await this.addressMapper.addIdentityMappingAsync(from, to, web3Signer)
  }
}
