import React from 'react'
import BN from 'bn.js'
import Card from './card'
import { TransferGateway, CryptoUtils } from 'loom-js'

export default class DAppChainCards extends React.Component {
  constructor(props) {
    super(props)
    this.state = { account: '0x', ethAccount: '0x', cardIds: [] }
  }

  async componentWillMount() {
    this.props.dcGatewayManager.onTokenWithdrawal(async event => {
      alert(`Card id ${event.value.toNumber()} ready for withdraw, check Cards On Gateway`)
    })

    await this.updateUI()
  }

  async updateUI() {
    const ethAccount = await this.props.ethAccountManager.getCurrentAccountAsync()
    const account = this.props.dcAccountManager.getCurrentAccount()
    const balance = await this.props.dcCardManager.getBalanceOfUserAsync(account)
    const mapping = await this.props.dcAccountManager.getAddressMappingAsync(ethAccount)

    let cardIds = []

    if (balance > 0) {
      cardIds = await this.props.dcCardManager.getTokensCardsOfUserAsync(account, balance)
    }

    this.setState({ account, cardIds, ethAccount, mapping })
  }

  async allowToWithdraw(cardId) {
    await this.props.dcCardManager.approveAsync(this.state.account, cardId)

    try {
      await this.props.dcGatewayManager.withdrawCardAsync(
        cardId,
        this.props.dcCardManager.getContractAddress()
      )
    } catch (err) {
      if (err.message.indexOf('pending') > -1) {
        alert('Pending withdraw exists, check Cards On Gateway')
      } else {
        console.error(err)
      }
    }

    // const data = await this.props.dcGatewayManager.withdrawalReceiptAsync(this.state.account)
    // const tokenOwner = data.tokenOwner.local.toString()
    // const signature = CryptoUtils.bytesToHexAddr(data.oracleSignature)

    // await this.props.ethGatewayManager.withdrawCardAsync(
    //   tokenOwner,
    //   cardId,
    //   signature,
    //   this.props.ethCardManager.getContractAddress()
    // )

    // alert('Wait 10 seconds to card be available on Ethereum Network')
  }

  render() {
    const cards = this.state.cardIds.map((cardId, idx) => {
      const cardDef = this.props.dcCardManager.getCardWithId(cardId)
      return (
        <Card
          title={cardDef.title}
          description={cardDef.description}
          key={idx}
          action="Allow Withdraw"
          handleOnClick={() => this.allowToWithdraw(cardId)}
        />
      )
    })

    const view = !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : cards.length > 0 ? (
      cards
    ) : (
      <p>No cards deposited on DAppChain yet</p>
    )

    return (
      <div>
        <h2>DAppChain Available Cards</h2>
        <div className="container">
          <div>{view}</div>
        </div>
      </div>
    )
  }
}
