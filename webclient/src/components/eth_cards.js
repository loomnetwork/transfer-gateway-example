import React from 'react'
import Card from './card'

export default class EthCards extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '0x',
      cardIds: [],
      mapping: null
    }
  }

  async componentWillMount() {
    // TODO: Add an event to reload UI
    await this.updateUI()
  }

  async updateUI() {
    const account = await this.props.ethAccountManager.getCurrentAccountAsync()
    const balance = await this.props.ethCardManager.getBalanceOfUserAsync(account)
    const mapping = await this.props.dcAccountManager.getAddressMappingAsync(account)

    let cardIds = []

    if (balance > 0) {
      cardIds = await this.props.ethCardManager.getTokensCardsOfUserAsync(account, balance)
    }

    this.setState({ account, cardIds, mapping })
  }

  async sendToDAppChain(cardId) {
    await this.props.ethCardManager.depositCardOnGateway(this.state.account, cardId)
    await this.updateUI()
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

    const view = !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : cards.length > 0 ? (
      cards
    ) : (
      <p>No cards deposited on Ethereum Network yet</p>
    )

    return (
      <div>
        <h2>Ethereum Network Available Cards</h2>
        <div className="container">
          <div>{view}</div>
        </div>
      </div>
    )
  }
}
