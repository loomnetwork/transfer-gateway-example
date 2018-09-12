// the view that shows the dapp tokens
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
      fakeKittyIds: [],
      fakeKittyBalance: 0,
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
    const fakeKittyBalance = (await this.props.dcFakeKittyManager.getBalanceOfUserAsync(account));

    console.log("this.props", this.props);
    console.log("dccardBalance", cardBalance);
    console.log("fakeKittyBalance", fakeKittyBalance);

    let cardIds = []
    let fakeKittyIds = []

    if (cardBalance > 0) {
      cardIds = await this.props.dcCardManager.getTokensCardsOfUserAsync(account, cardBalance)
    }

      console.log('fakeKittyIds before fetching', fakeKittyIds);
      if (fakeKittyBalance > 0) {
          fakeKittyIds = await this.props.dcFakeKittyManager.getFakeKittiesOfUserAsync(account, fakeKittyBalance)
      }
      console.log('fakeKittyIds after fetching', fakeKittyIds);

    this.setState({
      account,
      cardIds,
        fakeKittyIds,
      ethAccount,
      mapping,
      balance,
      ethBalance,
        fakeKittyBalance
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

    // I think at the end of this, we've plunked the card
    // into the gateway contract.  I think.
  async allowToWithdrawCard(cardId) {
    console.log("in allowToWithdrawCard with cardId", cardId);
    this.setState({ allowing: true })
    await this.props.dcCardManager.approveAsync(this.state.account, cardId)
    console.log("after approveAsync for cardId", cardId);

    try {
      await this.props.dcGatewayManager.withdrawCardAsync(
        cardId,
        this.props.dcCardManager.getContractAddress()
      )
        console.log("after withdrawCardAsync with cardId", cardId);

      alert('Processing allowance')
    } catch (err) {
      if (err.message.indexOf('pending') > -1) {
          // what this mean?
        alert('Pending withdraw exists, check Cards On Gateway')
      } else {
        console.error(err)
      }
    }

    this.setState({ allowing: false })

    await this.updateUI()
  }

    // this transfers the fakeKittyId to the gateway
    // after which it can be withdrawn to the mainnet
  async allowToWithdrawFakeKitty(fkId){
      console.log("in allowToWithdrawFakeKitty, this is where I pick up on Wed", fkId);
      this.setState({allowing: true})
      // this state.account => is the loom address of the token owner
      // loom owner is saying: i give gateway permission to transfer this token.
      console.log("this.props.dcFakeKittyManager", this.props.dcFakeKittyManager);
      await this.props.dcFakeKittyManager.approveAsync(this.state.account, fkId);
      console.log("after approveAsync for fakeKittyId", fkId);
      console.log("in allowToWithdrawFakeKitty with dcFakeKittyManager.getContractAddress()", this.props.dcFakeKittyManager.getContractAddress());

      try{
          // note this is the dcGatewayManager
          await this.props.dcGatewayManager.withdrawFakeKittyAsync(fkId, this.props.dcFakeKittyManager.getContractAddress())
          console.log("after withdrawFakeKittyAsync with fakeKittyId", fkId);
      } catch(err){
          console.log("error occurred", err);
      }
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

      console.log("this.state.fakeKittyIds", this.state.fakeKittyIds);
      const fakeKitties = this.state.fakeKittyIds.map((fkId,idx) => {
          const kittyDef = this.props.dcFakeKittyManager.getFakeKittyWithId(fkId);
          console.log("kittyDef", kittyDef);

          return(
              <Card
              title={`${kittyDef.title} (ERC721)`}
              description={kittyDef.description}
              key={idx}
              action="Allow Withdraw"
              handleOnClick={() => this.allowToWithdrawFakeKitty(fkId)}
              />
          )

      })

    console.log("fakeKitties.length", fakeKitties.length);
    const viewEth = this.state.ethBalance > 0 ? ethWallet : <p>No Ether available</p>
    const viewTokens = this.state.balance > 0 ? wallet : <p>No balance deposited on DAppChain yet</p>
    const viewCards = cards.length > 0 ? cards : <p>No cards deposited on DAppChain yet</p>
    const viewFakeKitties = fakeKitties.length > 0 ? fakeKitties : <p>No FakeCrytoKitties deposited on  DAppChain yet</p>

    return !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : (
      <div>
        <h2>DAppChain Available Token</h2>
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
                  {(this.state.cardIds.length  + this.state.fakeKittyIds.length) > 0 ? (this.state.cardIds.length + this.state.fakeKittyIds.length) : 0}
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
