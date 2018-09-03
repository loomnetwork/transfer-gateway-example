import React from 'react'
import Wallet from './wallet'
import Card from './card'

export default class EthTokens extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      account: '0x',
      mapping: null,
      sending: false,
      cardIds: [],
      balance: 0,
      ethBalance: 0
    }
  }

  async componentWillMount() {
    await this.updateUI()
  }

  async updateUI() {
    const account = await this.props.ethAccountManager.getCurrentAccountAsync()
    const balance = await this.props.ethTokenManager.getBalanceOfUserAsync(account)
    const cardsBalance = await this.props.ethCardManager.getBalanceOfUserAsync(account)
    const mapping = await this.props.dcAccountManager.getAddressMappingAsync(account)
    const ethBalance = await this.props.ethAccountManager.getEthAccountBalance(account)

    let cardIds = []

    if (cardsBalance > 0) {
      cardIds = await this.props.ethCardManager.getTokensCardsOfUserAsync(account, cardsBalance)
    }

    this.setState({ account, balance, mapping, cardIds, ethBalance })
  }

  async sendToDAppChainToken(amount) {
    this.setState({ sending: true })

    try {
      await this.props.ethTokenManager.depositTokenOnGateway(this.state.account, amount)
      alert('The amount will be available on DappChain, check DAppChain Account')
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
      alert('The Card will be available on DappChain, check DAppChain Account')
    } catch (err) {
      console.log('Transaction failed or denied by user')
    }

    this.setState({ sending: false })
    await this.updateUI()
  }

  async sendToDAppChainEth(amount) {
    this.setState({ sending: true })
    try {
      await this.props.ethGatewayManager.depositEthOnGateway(this.state.account, 1e16)
      alert('The Eth will be available on DappChain, check DAppChain Account')
    } catch (err) {
      console.log(err)

      console.log('Transaction failed or denied by user')
    }

    this.setState({ sending: false })
    await this.updateUI()
  }

  render() {
    const tokenWallet = (
      <Wallet
        title="Game Tokens (ERC20)"
        balance={this.state.balance}
        action="Send to DAppChain"
        handleOnClick={() => this.sendToDAppChainToken(this.state.balance)}
        disabled={this.state.sending}
      />
    )

    const ethWallet = (
      <Wallet
        title="Ether"
        balance={this.state.ethBalance}
        action="Send to DAppChain"
        handleOnClick={() => this.sendToDAppChainEth(this.state.ethBalance)}
        disabled={this.state.sending}
      />
    )

    const cards = this.state.cardIds.map((cardId, idx) => {
      const cardDef = this.props.ethCardManager.getCardWithId(cardId)

      return (
        <Card
          title={`${cardDef.title} (ERC721)`}
          description={cardDef.description}
          key={idx}
          action="Send to DAppChain"
          handleOnClick={() => this.sendToDAppChainCard(cardId)}
          disabled={this.state.sending}
        />
      )
    })

    const viewEth = this.state.ethBalance > 0 ? ethWallet : <p>No Ether available</p>
    const viewTokens = this.state.balance > 0 ? tokenWallet : <p>No tokens available</p>
    const viewCards = cards.length > 0 ? cards : <p>No cards deposited on Ethereum Network yet</p>

    return !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : (
      <div>
        <h2>Ethereum Network Owned Tokens</h2>
        <div className="container">
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a
                className="nav-link active"
                id="ETH-tab"
                data-toggle="tab"
                href="#ETH"
                role="tab"
                aria-controls="ETH"
                aria-selected="true">
                ETH
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="ERC20-tab"
                data-toggle="tab"
                href="#ERC20"
                role="tab"
                aria-controls="ERC20"
                aria-selected="false">
                ERC20
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="ERC721-tab"
                data-toggle="tab"
                href="#ERC721"
                role="tab"
                aria-controls="ERC721"
                aria-selected="false">
                ERC721
              </a>
            </li>
          </ul>

          <div className="tab-content">
            <div className="tab-pane active" id="ETH" role="tabpanel" aria-labelledby="ETH-tab">
              {viewEth}
            </div>
            <div className="tab-pane" id="ERC20" role="tabpanel" aria-labelledby="ERC20-tab">
              {viewTokens}
            </div>
            <div className="tab-pane" id="ERC721" role="tabpanel" aria-labelledby="ERC721-tab">
              {viewCards}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
