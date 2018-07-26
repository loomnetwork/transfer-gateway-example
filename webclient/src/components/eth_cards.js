import React from 'react'
import Card from './card'

export default class EthCards extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '0x',
      cardIds: []
    }
  }

  async componentWillMount() {
    const account = await this.props.ethAccountManager.getCurrentAccountAsync()
    const balance = await this.props.ethCardManager.getBalanceOfUserAsync(account)
    console.log(account, balance)

    let cardIds = []

    if (balance > 0) {
      cardIds = await this.props.ethCardManager.getTokensCardsOfUserAsync(account)
    }

    this.setState({ account, cardIds })
  }

  async sendToDAppChain(cardId) {
    await this.props.ethCardManager.depositCardOnGateway(this.state.account, cardId)
    const balance = await this.props.ethCardManager.getBalanceOfUserAsync(this.state.account)
    console.log(this.state.account, balance)
  }

  render() {
    const cards = this.state.cardIds.map((cardId, idx) => {
      const cardDef = this.props.ethCardManager.getCardWithId(cardId)
      return (
        <Card
          title={cardDef.title}
          description={cardDef.description}
          key={idx}
          action="Send to DAppChain"
          handleOnClick={() => this.sendToDAppChain(cardId)}
        />
      )
    })

    return (
      <div>
        <h2>Ethereum Network Available Cards</h2>
        <div className="container">
          <div>{cards}</div>
        </div>
      </div>
    )
  }
}
