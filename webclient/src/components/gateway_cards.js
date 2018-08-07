import React from 'react'
import Card from './card'
import { CryptoUtils } from 'loom-js'

export default class EthCards extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      ethAccount: '0x',
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
    const ethAccount = await this.props.ethAccountManager.getCurrentAccountAsync()
    const mapping = await this.props.dcAccountManager.getAddressMappingAsync(ethAccount)
    const account = this.props.dcAccountManager.getCurrentAccount()
    const data = await this.props.dcGatewayManager.withdrawalReceiptAsync(account)

    let cardIds = []
    if (data) {
      cardIds = [data.value.toNumber()]
    }

    this.setState({ account, cardIds, mapping })
  }

  async withdrawFromGateway(cardId) {
    const data = await this.props.dcGatewayManager.withdrawalReceiptAsync(this.state.account)
    const tokenOwner = data.tokenOwner.local.toString()
    const signature = CryptoUtils.bytesToHexAddr(data.oracleSignature)

    try {
      await this.props.ethGatewayManager.withdrawCardAsync(
        tokenOwner,
        cardId,
        signature,
        this.props.ethCardManager.getContractAddress()
      )

      alert('Card withdraw with success, check Owned Cards')
    } catch (err) {
      console.error(err)
    }
  }

  render() {
    const cards = this.state.cardIds.map((cardId, idx) => {
      const cardDef = this.props.ethCardManager.getCardWithId(cardId)

      return (
        <Card
          title={cardDef.title}
          description={cardDef.description}
          key={idx}
          action="Withdraw from gateway"
          handleOnClick={() => this.withdrawFromGateway(cardId)}
        />
      )
    })

    const view = !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : cards.length > 0 ? (
      cards
    ) : (
      <p>No cards deposited on Gateway yet</p>
    )

    return (
      <div>
        <h2>Ethereum Network Gateway Cards</h2>
        <div className="container">
          <div>{view}</div>
        </div>
      </div>
    )
  }
}
