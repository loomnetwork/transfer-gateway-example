import React from 'react'

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = { account: '0x', dcAccount: '0x', mapping: null }
  }

  async componentWillMount() {
    const account = await this.props.ethAccountManager.getCurrentAccountAsync()
    const dcAccount = this.props.dcAccountManager.getCurrentAccount()
    this.setState({ account, dcAccount })
    await this.updateMapping()
  }

  async updateMapping() {
    const mapping = await this.props.dcAccountManager.getAddressMappingAsync(this.state.account)
      console.log("in updateMapping with mapping", mapping);
    if (mapping) {
      console.log('Mapped accounts', mapping.from.toString(), mapping.to.toString())
    }
    this.setState({ mapping })
  }

  async sign() {
      console.log("in async sign with state", this.state);
    await this.props.dcAccountManager.signAsync(this.state.account)
    await this.updateMapping()
    location.reload()
  }

  render() {
    const signView = (
      <div>
        <p>
          By signing the contract you are confirming that your Ethereum account (
          {this.state.account}) on MetaMask is related with account on DappChain (
          {this.state.dcAccount})
        </p>
        <button className="btn btn-primary" onClick={() => this.sign()}>
          Click to Sign
        </button>
      </div>
    )

    if (!this.state.account) {
      return (
        <div>
          <p>No MetaMask detected, please check if installed and active</p>
        </div>
      )
    }

    const signedView = <div>Thanks for sign</div>

    return (
      <div>
        <h2>Home</h2>
        {this.state.mapping ? signedView : signView}
      </div>
    )
  }
}
