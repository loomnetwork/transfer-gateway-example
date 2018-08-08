import Web3 from 'web3'

export default class EthGatewayManager {
  static async createAsync() {
    const browserWeb3 = new Web3(window.web3.currentProvider)
    const networkId = await browserWeb3.eth.net.getId()
    const contract = new browserWeb3.eth.Contract(
      GATEWAY_JSON.abi,
      GATEWAY_JSON.networks[networkId].address
    )

    return new EthGatewayManager(contract)
  }

  constructor(contract) {
    this.contract = contract
  }

  async isTokensCardOfUserAsync(address, cardId, gatewayContract) {
    return await this._contract.methods
      .getNFT(address, cardId, gatewayContract)
      .call({ from: address })
  }

  async withdrawCardAsync(address, cardId, sig, contractAddress) {
    console.log(address, cardId, sig, contractAddress)
    return await this.contract.methods
      .withdrawERC721(cardId, sig, contractAddress)
      .send({ from: address, gas: '189362' })
  }
}
