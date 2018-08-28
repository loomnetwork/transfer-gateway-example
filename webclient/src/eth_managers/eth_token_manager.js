import Web3 from 'web3'

export default class EthGameTokenManager {
  static async createAsync() {
    const browserWeb3 = new Web3(window.web3.currentProvider)
    const networkId = await browserWeb3.eth.net.getId()

    const contract = new browserWeb3.eth.Contract(
      GAME_TOKEN_JSON.abi,
      GAME_TOKEN_JSON.networks[networkId].address
    )

    return new EthGameTokenManager(contract)
  }

  constructor(contract) {
    this._contract = contract
  }

  getContractAddress() {
    return this._contract.options.address
  }

  async getBalanceOfUserAsync(address) {
    return await this._contract.methods.balanceOf(address).call({ from: address })
  }

  async depositTokenOnGateway(address, amount) {
    return await this._contract.methods
      .depositToGateway(amount)
      .send({ from: address, gas: '219362' })
  }
}
