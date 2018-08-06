import React from 'react'
import Card from './card'
import { bytesToHex } from '../../node_modules/loom-js/dist/crypto-utils'
import { bytesToHexAddr } from '../../node_modules/loom-js/dist/crypto-utils'

export default class DAppChainCards extends React.Component {
  constructor(props) {
    super(props)
    this.state = { account: '0x', ethAccount: '0x', cardIds: [] }
  }

  async componentWillMount() {
    // TODO: Add an event to reload UI
    await this.updateUI()
  }

  async updateUI() {
    const ethAccount = await this.props.ethAccountManager.getCurrentAccountAsync()
    const account = this.props.dcAccountManager.getCurrentAccount()
    const balance = await this.props.dcCardManager.getBalanceOfUserAsync(account)

    let cardIds = []

    if (balance > 0) {
      cardIds = await this.props.dcCardManager.getTokensCardsOfUserAsync(account, balance)
    }

    this.setState({ account, cardIds, ethAccount })
  }

  async withdrawToMainnet(cardId) {
    await this.props.dcCardManager.approveAsync(this.state.account, cardId)
    await this.props.dcCardManager.withdrawCardAsync(cardId)
    const data = await this.props.dcCardManager.withdrawalReceiptAsync(this.state.account)

    const tokenOwner = data.tokenOwner.local.toString()
    const signature = bytesToHexAddr(data.oracleSignature)

    console.log('oracle signature', signature)

    await this.props.gatewayManager.withdrawCardAsync(
      tokenOwner,
      cardId,
      signature,
      this.props.ethCardManager.getContractAddress()
    )
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
