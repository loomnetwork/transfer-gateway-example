import Web3 from 'web3'
import CardList from './card_list'

export default class EthCardManager {
  static async createAsync() {
    const browserWeb3 = new Web3(window.web3.currentProvider)
    const networkId = await browserWeb3.eth.net.getId()
    const contract = new browserWeb3.eth.Contract(
      CRYPTO_CARDS_JSON.abi,
      CRYPTO_CARDS_JSON.networks[networkId].address
    )

    return new EthCardManager(contract)
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
    return await this.contract.methods
      .depositToGateway(cardId)
      .send({ from: address, gas: '189362' })
  }
}
