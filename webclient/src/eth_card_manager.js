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
    this._contract = contract
  }

  getCardWithId(cardId) {
    return CardList[cardId]
  }

  getContractAddress() {
    return this._contract.options.address
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

  async depositCardOnGateway(address, cardId) {
    return await this._contract.methods
      .depositToGateway(cardId)
      .send({ from: address, gas: '219362' })
  }
}
