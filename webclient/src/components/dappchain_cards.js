import React from 'react'
import Card from './card'

export default class DAppChainCards extends React.Component {
  constructor(props) {
    super(props)
    this.state = { account: '0x', cardIds: [] }
  }

  async componentWillMount() {
    const account = this.props.dcAccountManager.getCurrentAccount()
    const balance = await this.props.dcCardManager.getBalanceOfUserAsync(account)

    console.log(account, balance)

    let cardIds = []

    if (balance > 0) {
      cardIds = await this.props.dcCardManager.getTokensCardsOfUserAsync(account)
    }

    console.log(cardIds)

    this.setState({ account, cardIds })
  }

  async withdrawToMainnet(cardId) {
    await this.props.dcCardManager.depositCardOnGateway(this.state.account, cardId)
  }

  render() {
    const cards = this.state.cardIds.map((cardId, idx) => {
      const cardDef = this.props.dcCardManager.getCardWithId(cardId)
      return (
        <Card
          title={cardDef.title}
          description={cardDef.description}
          key={idx}
          action="Withdraw"
          handleOnClick={() => this.withdrawToMainnet(cardId)}
        />
      )
    })

    return (
      <div>
        <h2>DAppChain Available Cards</h2>
        <div className="container">
          <div>{cards}</div>
        </div>
      </div>
    )
  }
}
