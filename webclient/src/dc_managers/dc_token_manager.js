import Web3 from 'web3'

const {
  NonceTxMiddleware,
  SignedTxMiddleware,
  Client,
  LocalAddress,
  CryptoUtils,
  LoomProvider
} = require('loom-js/dist')

export default class DAppChainTokenManager {
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

    const from = LocalAddress.fromPublicKey(publicKey).toString()
    const web3 = new Web3(new LoomProvider(client, privateKey))

    const networkId = await web3.eth.net.getId()

    client.on('error', msg => {
      console.error('Error on connect to client', msg)
      console.warn('Please verify if loom command is running')
    })

    const contract = new web3.eth.Contract(
      DC_GAME_TOKEN_JSON.abi,
      DC_GAME_TOKEN_JSON.networks[networkId].address,
      { from }
    )

    return new DAppChainTokenManager(client, contract, web3)
  }

  constructor(client, contract, web3) {
    this._client = client
    this._contract = contract
    this._web3 = web3
  }

  getContractAddress() {
    return this._contract.options.address
  }

  async getBalanceOfUserAsync(address) {
    return await this._contract.methods.balanceOf(address).call({ from: address })
  }

  async approveAsync(address, amount) {
    const addr = this._web3.utils.toChecksumAddress('0xC5d1847a03dA59407F27f8FE7981D240bff2dfD3')
    const iban = this._web3.eth.Iban.toIban(addr)
    return await this._contract.methods.approve(iban, amount).send({ from: address })
  }
}
