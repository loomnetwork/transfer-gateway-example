import React from 'react'
import { NavLink } from 'react-router-dom'

export default class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '0x'
    }
  }

  async componentWillMount() {
    const account = await this.props.ethAccountManager.getCurrentAccountAsync()
    this.setState({ account })
  }

  render() {
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
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <NavLink to="/eth_cards" activeClassName="active" className="nav-link">
                Owned Cards
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/gateway_cards" activeClassName="active" className="nav-link">
                Cards on Gateway
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/dappchain_cards" activeClassName="active" className="nav-link">
                Cards on DappChain
              </NavLink>
            </li>
          </ul>
          <form className="form-inline mt-2 mt-md-0">
            <button className="btn btn-outline-success my-2 my-sm-0" type="button">
              {this.state.account}
            </button>
          </form>
        </div>
      </nav>
    )
  }
}
