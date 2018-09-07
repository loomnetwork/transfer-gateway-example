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
      fakeKittyIds: [],
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

      const fakeKittyBalance = await this.props.ethFakeKittyManager.getBalanceOfUserAsync(account);
      // great, we have one!
      console.log("fakeKittyBalance", fakeKittyBalance);


    let cardIds = []
      let fakeKittyIds  = []

    if (cardsBalance > 0) {
      cardIds = await this.props.ethCardManager.getTokensCardsOfUserAsync(account, cardsBalance)
    }

      console.log("fakeKittyIds before looping", fakeKittyIds)
      if (fakeKittyBalance > 0){
          fakeKittyIds = await this.props.ethFakeKittyManager.getFakeKittiesOfUserAsync(account, fakeKittyBalance);
      }

      console.log("fakeKittyIds after looping", fakeKittyIds)
    this.setState({ account, balance, mapping, cardIds, fakeKittyIds, ethBalance })
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

      console.log("this.state.fakeKittyIds", this.state.fakeKittyIds);
      //const fakeKitties = this.state.fakeKittyIds
      //
      const fakeKitties = this.state.fakeKittyIds.map((fkId,idx) => {
          const kittyDef = this.props.ethFakeKittyManager.getFakeKittyWithId(fkId);

          return(
              <Card
              title={`${kittyDef.title} (ERC721)`}
              description={kittyDef.description}
              key={idx}
              action="Send to DAppChain"
      //handleOnClick={() => this.sendToDAppChainCard(fkId)}
              />
          )

      })


    const viewEth = this.state.ethBalance > 0 ? ethWallet : <p>No Ether available</p>
    const viewTokens = this.state.balance > 0 ? tokenWallet : <p>No tokens available</p>
    const viewCards = cards.length > 0 ? cards : <p>No cards deposited on Ethereum Network yet</p>

    const viewFakeKitties = fakeKitties.length > 0 ? fakeKitties : <p>No FakeCrytoKitties deposited on Ethereum Network yet</p>

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
                ETH&nbsp;
                <span className="badge badge-light">{this.state.ethBalance > 0 ? 1 : 0}</span>
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
                ERC20&nbsp;
                <span className="badge badge-light">{this.state.balance > 0 ? 1 : 0}</span>
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
                ERC721&nbsp;
                <span className="badge badge-light">
                  {(this.state.cardIds.length + this.state.fakeKittyIds.length > 0) ? (this.state.cardIds.length + this.state.fakeKittyIds.length) : 0}
                </span>
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
      {viewFakeKitties}

            </div>
          </div>
        </div>
      </div>
    )
  }
}
