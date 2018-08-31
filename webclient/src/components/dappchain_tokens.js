import React from 'react'
import BN from 'bn.js'
import Wallet from './wallet'
import Card from './card'

export default class DAppChainTokens extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      account: '0x',
      ethAccount: '0x',
      cardIds: [],
      ethBalance: 0,
      balance: 0,
      allowing: false
    }
  }

  async componentWillMount() {
    this.props.dcGatewayManager.onTokenWithdrawal(async event => {
      alert(`Token ${event.value} ready for withdraw, check Ethereum Gateway`)
      await this.updateUI()
    })

    await this.updateUI()
  }

  async updateUI() {
    const ethAccount = await this.props.ethAccountManager.getCurrentAccountAsync()
    const account = this.props.dcAccountManager.getCurrentAccount()
    const cardBalance = await this.props.dcCardManager.getBalanceOfUserAsync(account)
    const balance = await this.props.dcTokenManager.getBalanceOfUserAsync(account)
    const mapping = await this.props.dcAccountManager.getAddressMappingAsync(ethAccount)
    const ethBalance = (await this.props.dcAccountManager.getEthCoinBalance()).toString()

    let cardIds = []

    if (cardBalance > 0) {
      cardIds = await this.props.dcCardManager.getTokensCardsOfUserAsync(account, cardBalance)
    }

    this.setState({
      account,
      cardIds,
      ethAccount,
      mapping,
      balance,
      ethBalance
    })
  }

  async allowToWithdrawToken(amount) {
    this.setState({ allowing: true })
    await this.props.dcTokenManager.approveAsync(this.state.account, amount)

    try {
      await this.props.dcGatewayManager.withdrawTokenAsync(
        amount,
        this.props.dcTokenManager.getContractAddress()
      )

      alert('Processing allowance')
    } catch (err) {
      if (err.message.indexOf('pending') > -1) {
        alert('Pending withdraw exists, check Ethereum Gateway')
      } else {
        console.error(err)
      }
    }

    this.setState({ allowing: false })

    await this.updateUI()
  }

  async allowToWithdrawEth(amount) {
    this.setState({ allowing: true })
    await this.props.dcAccountManager.approveAsync(this.state.account, amount)

    try {
      await this.props.dcGatewayManager.withdrawEthAsync(amount)

      alert('Processing allowance')
    } catch (err) {
      if (err.message.indexOf('pending') > -1) {
        alert('Pending withdraw exists, check Ethereum Gateway')
      } else {
        console.error(err)
      }
    }

    this.setState({ allowing: false })

    await this.updateUI()
  }

  async allowToWithdrawCard(cardId) {
    this.setState({ allowing: true })
    await this.props.dcCardManager.approveAsync(this.state.account, cardId)

    try {
      await this.props.dcGatewayManager.withdrawCardAsync(
        cardId,
        this.props.dcCardManager.getContractAddress()
      )

      alert('Processing allowance')
    } catch (err) {
      if (err.message.indexOf('pending') > -1) {
        alert('Pending withdraw exists, check Cards On Gateway')
      } else {
        console.error(err)
      }
    }

    this.setState({ allowing: false })

    await this.updateUI()
  }

  render() {
    const wallet = (
      <Wallet
        balance={this.state.balance}
        action="Allow Withdraw"
        handleOnClick={() => this.allowToWithdrawToken(this.state.balance)}
        disabled={this.state.sending}
      />
    )

    const ethWallet = (
      <Wallet
        title="Ether"
        balance={this.state.ethBalance}
        action="Allow Withdraw"
        handleOnClick={() => this.allowToWithdrawEth(this.state.ethBalance)}
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
          action="Allow Withdraw"
          handleOnClick={() => this.allowToWithdrawCard(cardId)}
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
      <p>No balance deposited on DAppChain yet</p>
    )

    const viewCards = !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : cards.length > 0 ? (
      cards
    ) : (
      <p>No cards deposited on DAppChain yet</p>
    )

    return (
      <div>
        <h2>DAppChain Available Token</h2>
        <div className="container">
          <div>{viewEth}</div>
          <div>{viewTokens}</div>
          <div>{viewCards}</div>
        </div>
      </div>
    )
  }
}
