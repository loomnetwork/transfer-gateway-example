import React from 'react'
import Wallet from './wallet'
import Card from './card'

export default class EthTokens extends React.Component {
  constructor(props) {
    super(props)

    this.state = { account: '0x', mapping: null, sending: false, cardIds: [], balance: 0 }
  }

  async componentWillMount() {
    await this.updateUI()
  }

  async updateUI() {
    const account = await this.props.ethAccountManager.getCurrentAccountAsync()
    const balance = await this.props.ethTokenManager.getBalanceOfUserAsync(account)
    const cardsBalance = await this.props.ethCardManager.getBalanceOfUserAsync(account)
    const mapping = await this.props.dcAccountManager.getAddressMappingAsync(account)

    let cardIds = []

    if (cardsBalance > 0) {
      cardIds = await this.props.ethCardManager.getTokensCardsOfUserAsync(account, cardsBalance)
    }

    this.setState({ account, balance, mapping, cardIds })
  }

  async sendToDAppChainToken(amount) {
    this.setState({ sending: true })

    try {
      await this.props.ethTokenManager.depositTokenOnGateway(this.state.account, amount)
      alert('The amount will be available on DappChain, check DAppChain ')
    } catch (err) {
      console.log('Transaction failed or denied by user')
    }

    this.setState({ sending: false })
    await this.updateUI()
  }

  async sendToDAppChainCard(cardId) {
    this.setState({ sending: true })
    try {
      await this.props.ethCardManager.depositCardOnGateway(this.state.account, cardId)
      alert('The Card will be available on DappChain, check DAppChain Cards')
    } catch (err) {
      console.log('Transaction failed or denied by user')
    }

    this.setState({ sending: false })
    await this.updateUI()
  }

  render() {
    const wallet = (
      <Wallet
        balance={this.state.balance}
        action="Send to DAppChain"
        handleOnClick={() => this.sendToDAppChainToken(this.state.balance)}
        disabled={this.state.sending}
      />
    )

    const cards = this.state.cardIds.map((cardId, idx) => {
      const cardDef = this.props.ethCardManager.getCardWithId(cardId)

      return (
        <Card
          title={cardDef.title}
          description={cardDef.description}
          key={idx}
          action="Send to DAppChain"
          handleOnClick={() => this.sendToDAppChainCard(cardId)}
          disabled={this.state.sending}
        />
      )
    })

    const viewTokens = !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : this.state.balance > 0 ? (
      wallet
    ) : (
      <p>No tokens available</p>
    )

    const viewCards = !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : cards.length > 0 ? (
      cards
    ) : (
      <p>No cards deposited on Ethereum Network yet</p>
    )

    return (
      <div>
        <h2>Ethereum Network Owned Tokens</h2>
        <div className="container">
          <div>{viewTokens}</div>
          <div>{viewCards}</div>
        </div>
      </div>
    )
  }
}
