import Web3 from 'web3'

export default class EthGatewayManager {
  static async createAsync() {
    const browserWeb3 = new Web3(window.web3.currentProvider)
    const networkId = await browserWeb3.eth.net.getId()
    const contract = new browserWeb3.eth.Contract(
      GATEWAY_JSON.abi,
      GATEWAY_JSON.networks[networkId].address
    )

    return new EthGatewayManager(contract, browserWeb3)
  }

  constructor(contract, browserWeb3) {
    this._contract = contract
    this._browserWeb3 = browserWeb3
  }

  async isTokensCardOfUserAsync(address, cardId, gatewayContract) {
    return await this._contract.methods
      .getNFT(address, cardId, gatewayContract)
      .call({ from: address })
  }

  async withdrawCardAsync(address, cardId, sig, contractAddress) {
    console.log(address, cardId, sig, contractAddress)
    return await this._contract.methods
      .withdrawERC721(cardId, sig, contractAddress)
      .send({ from: address, gas: '189362' })
  }

  async withdrawTokenAsync(address, amount, sig, contractAddress) {
    return await this._contract.methods
      .withdrawERC20(amount, sig, contractAddress)
      .send({ from: address, gas: '189362' })
  }

  async withdrawEthAsync(address, amount, sig) {
    return await this._contract.methods
      .withdrawETH(amount, sig)
      .send({ from: address, gas: '489362' })
  }

  async depositEthOnGateway(from, value) {
    const to = this._contract.options.address
    console.log('from, to, value', from, to, value)
    return await this._browserWeb3.eth.sendTransaction({
      from,
      to,
      value
    })
  }
}
