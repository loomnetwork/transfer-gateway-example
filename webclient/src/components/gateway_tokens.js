import React from 'react'
import { CryptoUtils } from 'loom-js'
import Wallet from './wallet'
import Card from './card'

export default class GatewayTokens extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      ethAccount: '0x',
      account: '0x',
      cardIds: [],
      balance: 0,
      ethBalance: 0,
      mapping: null,
      withdrawing: false
    }
  }

  async componentWillMount() {
    await this.updateUI()
  }

  async updateUI() {
    const ethAccount = await this.props.ethAccountManager.getCurrentAccountAsync()
    const mapping = await this.props.dcAccountManager.getAddressMappingAsync(ethAccount)
    const account = this.props.dcAccountManager.getCurrentAccount()
    const data = await this.props.dcGatewayManager.withdrawalReceiptAsync(account)

    let ethBalance = 0
    let balance = 0
    let cardIds = []
    if (data) {
      switch (data.tokenKind) {
        case 0:
          ethBalance = +data.value.toString(10)
          break
        case 1:
          balance = +data.value.toString(10)
          break
        case 2:
          cardIds = [data.value.toNumber()]
          break
      }
    }

    this.setState({ account, mapping, balance, cardIds, ethBalance })
  }

  async withdrawFromGatewayToken(amount) {
    this.setState({ withdrawing: true })
    const data = await this.props.dcGatewayManager.withdrawalReceiptAsync(this.state.account)
    const tokenOwner = data.tokenOwner.local.toString()
    const signature = CryptoUtils.bytesToHexAddr(data.oracleSignature)

    try {
      await this.props.ethGatewayManager.withdrawTokenAsync(
        tokenOwner,
        amount,
        signature,
        this.props.ethTokenManager.getContractAddress()
      )

      alert('Token withdraw with success, check Owned Tokens')
    } catch (err) {
      console.error(err)
    }

    this.setState({ withdrawing: true })
    await this.updateUI()
  }

  async withdrawFromGatewayEth(amount) {
    this.setState({ withdrawing: true })
    const data = await this.props.dcGatewayManager.withdrawalReceiptAsync(this.state.account)
    const tokenOwner = data.tokenOwner.local.toString()
    const signature = CryptoUtils.bytesToHexAddr(data.oracleSignature)

    try {
      await this.props.ethGatewayManager.withdrawEthAsync(tokenOwner, amount, signature)

      alert('Token withdraw with success, check Owned Tokens')
    } catch (err) {
      console.error(err)
    }

    this.setState({ withdrawing: true })
    await this.updateUI()
  }

  async withdrawFromGatewayCard(cardId) {
    this.setState({ withdrawing: true })
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

    this.setState({ withdrawing: true })
    await this.updateUI()
  }

  render() {
    const wallet = (
      <Wallet
        title="Game Token"
        balance={this.state.balance}
        action="Withdraw from gateway"
        handleOnClick={() => this.withdrawFromGatewayToken(this.state.balance)}
        disabled={this.state.sending}
      />
    )

    const ethWallet = (
      <Wallet
        title="Ether"
        balance={this.state.ethBalance}
        action="Withdraw from gateway"
        handleOnClick={() => this.withdrawFromGatewayEth(this.state.ethBalance)}
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
          action="Withdraw from gateway"
          handleOnClick={() => this.withdrawFromGatewayCard(cardId)}
          disabled={this.state.sending}
        />
      )
    })

    const viewEth = !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : this.state.ethBalance > 0 ? (
      ethWallet
    ) : (
      <p>No Ether available</p>
    )

    const viewTokens = !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : this.state.balance > 0 ? (
      wallet
    ) : (
      <p>No balance deposited on Gateway yet</p>
    )

    const viewCards = !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : cards.length > 0 ? (
      cards
    ) : (
      <p>No cards deposited on Gateway yet</p>
    )

    return (
      <div>
        <h2>Ethereum Network Gateway Tokens</h2>
        <div className="container">
          <div>{viewEth}</div>
          <div>{viewTokens}</div>
          <div>{viewCards}</div>
        </div>
      </div>
    )
  }
}
