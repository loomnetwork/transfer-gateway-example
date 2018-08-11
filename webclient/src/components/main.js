import React from 'react'
import { NavLink } from 'react-router-dom'

export default class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '0x',
      mapping: null
    }
  }

  async componentWillMount() {
    const account = await this.props.ethAccountManager.getCurrentAccountAsync()
    const mapping = !!(await this.props.dcAccountManager.getAddressMappingAsync(account))
    this.setState({ account, mapping })
  }

  render() {
    const navLinks = (
      <ul className="navbar-nav mr-auto">
        <li className="nav-item">
          <NavLink to="/eth_cards" activeClassName="active" className="nav-link">
            Ethereum Account
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/gateway_cards" activeClassName="active" className="nav-link">
            Ethereum Gateway
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/dappchain_cards" activeClassName="active" className="nav-link">
            DAppChain Account
          </NavLink>
        </li>
      </ul>
    )

    const accountButton = (
      <button className="btn btn-outline-success my-2 my-sm-0" type="button">
        {this.state.account}
      </button>
    )

    return (
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <NavLink to="/" className="navbar-brand">
          Cards Gateway
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          {this.state.account && this.state.mapping ? navLinks : ''}
          <form className="form-inline mt-2 mt-md-0 text-right">
            {this.state.account && this.state.mapping ? accountButton : ''}
          </form>
        </div>
      </nav>
    )
  }
}
