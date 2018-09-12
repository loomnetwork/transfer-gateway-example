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
      fakeKittyIds: [],
      fakeKittyBalance: 0,
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
      console.log("in GatewayTokens updateUI with props", this.props);
    const ethAccount = await this.props.ethAccountManager.getCurrentAccountAsync()
    const mapping = await this.props.dcAccountManager.getAddressMappingAsync(ethAccount)
    const account = this.props.dcAccountManager.getCurrentAccount()
      // will need to pass more info in the withdrawalReceiptAsync to determine which KIND of 721 it is
    const data = await this.props.dcGatewayManager.withdrawalReceiptAsync(account)
      console.log("data", data);
      console.log("data.tokenContract", data.tokenContract)
      // ok this gives us the contract address and the chain id (ex "eth" or "loom" (default?))
      console.log("data.tokenContract.toString()", data.tokenContract.toString())

    let ethBalance = 0
    let balance = 0
    let fakeKittyBalance = 0
    let cardIds = []
    let fakeKittyIds = []
    console.log("in gateway_tokens with data", data);
    if (data) {
        // interesting // tokenKind is coming from loom
        // i bet it's 0 = eth; 1, erc20, 2, erc721
        //
      switch (data.tokenKind) {

        case 0:
          ethBalance = +data.value.toString(10)
          break
        case 1:
          balance = +data.value.toString(10)
          break
        case 2:
              let tokenComponents = data.tokenContract.toString().split(":");
              let chainId = tokenComponents[0];
              let contractAddr = tokenComponents[1];
              console.log("chainId", chainId, "contractAddr", contractAddr);
              // how to check which one -- by name or type?
              // i know how to do it hard-coded, but
              // huh if this is erc721s
              // we need to be more specific 
              // ex. which one or do a check
              // on it's name
              //
              // TODO write a mapper class with all the contract abis & addresses. 
              // but for now.... we know we have two kinds
              // also TODO --- this looks like it just handles one at a time
              console.log("hey, we're with tokenKind 2");
              console.log("contractAddr", contractAddr);
              console.log("cards address", this.props.ethCardManager.getContractAddress())
              console.log("kitties address", this.props.ethFakeKittyManager.getContractAddress())
              if(contractAddr.toLowerCase() == this.props.ethCardManager.getContractAddress().toLowerCase()){
                  console.log("i'm the eth cards contract");
                  cardIds = [data.value.toNumber()]
              }
              if(contractAddr.toLowerCase() == this.props.ethFakeKittyManager.getContractAddress().toLowerCase()){
                  console.log("Fake kitties yo!");
                  fakeKittyIds = [data.value.toNumber()]
              }
          break
      }
    }

    this.setState({ account, mapping, balance,fakeKittyBalance, cardIds,fakeKittyIds, ethBalance })
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
      // getting a card off the gateway
      console.log("in withdrawFromGatewayCard", cardId);
    this.setState({ withdrawing: true })
    const data = await this.props.dcGatewayManager.withdrawalReceiptAsync(this.state.account)
    const tokenOwner = data.tokenOwner.local.toString()
    const signature = CryptoUtils.bytesToHexAddr(data.oracleSignature)
      console.log("data", data);

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

    async withdrawFromGatewayFakeKitty(fkId){
        console.log("in withdrawFromGatewayFakeKitty", fkId);
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


  const fakeKitties = this.state.fakeKittyIds.map((fkId,idx) => {
      const kittyDef = this.props.dcFakeKittyManager.getFakeKittyWithId(fkId);
      console.log("kittyDef", kittyDef);

      return(
          <Card
          title={`${kittyDef.title} (ERC721)`}
          description={kittyDef.description}
          key={idx}
          action="Withdraw from Gateway"
          handleOnClick={() => this.withdrawFromGatewayFakeKitty(fkId)}
          disabled={this.state.sending}
          />
      )
  })

      console.log("fakeKitties.length", fakeKitties.length);
    const viewEth = this.state.ethBalance > 0 ? ethWallet : <p>No Ether available</p>
    const viewTokens = this.state.balance > 0 ? wallet : <p>No balance deposited on Gateway yet</p>
    const viewCards = cards.length > 0 ? cards : <p>No cards deposited on Gateway yet</p>
    const viewFakeKitties = fakeKitties.length > 0 ? fakeKitties : <p> No Fake kitties on gateway yet </p>;
      console.log("viewFakeKitties", viewFakeKitties);

    return !this.state.mapping ? (
      <p>Please sign your user first</p>
    ) : (
      <div>
        <h2>Ethereum Network Gateway Tokens</h2>
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
                  {(this.state.cardIds.length + this.state.fakeKittyIds.length) > 0 ? (this.state.cardIds.length + this.state.fakeKittyIds.length) : 0}
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
