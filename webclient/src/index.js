import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'

import Main from './components/main'
import Home from './components/home'
import EthCards from './components/eth_cards'
import DAppChainCards from './components/dappchain_cards'
import GatewayCards from './components/gateway_cards'
import EthAccountManager from './eth_managers/eth_account_manager'
import EthCardManager from './eth_managers/eth_card_manager'
import EthGatewayManager from './eth_managers/eth_gateway_manager'
import DAppChainAccountManager from './dc_managers/dc_account_manager'
import DAppChainCardManager from './dc_managers/dc_card_manager'
import DAppChainGatewayManager from './dc_managers/dc_gateway_manager'
;(async () => {
  console.log('Loading ...')
  const t = setTimeout(
    () =>
      console.log(
        '\n\n----> If this takes too long to start, please try to reset MetaMask cache :)'
      ),
    5000
  )

  const ethCardManager = await EthCardManager.createAsync()
  const ethAccountManager = await EthAccountManager.createAsync()
  const dcAccountManager = await DAppChainAccountManager.createAsync()
  const dcCardManager = await DAppChainCardManager.createAsync()
  const ethGatewayManager = await EthGatewayManager.createAsync()
  const dcGatewayManager = await DAppChainGatewayManager.createAsync()

  clearTimeout(t)

  const BuildMain = () => (
    <Main
      ethAccountManager={ethAccountManager}
      ethCardManager={ethCardManager}
      dcAccountManager={dcAccountManager}
      dcCardManager={dcCardManager}
    />
  )

  const BuildHome = () => (
    <Home
      ethAccountManager={ethAccountManager}
      ethCardManager={ethCardManager}
      dcAccountManager={dcAccountManager}
      dcCardManager={dcCardManager}
    />
  )

  const BuildEthCards = () => (
    <EthCards
      ethAccountManager={ethAccountManager}
      ethCardManager={ethCardManager}
      dcAccountManager={dcAccountManager}
      dcCardManager={dcCardManager}
    />
  )

  const BuildGatewayCards = () => (
    <GatewayCards
      ethAccountManager={ethAccountManager}
      ethGatewayManager={ethGatewayManager}
      ethCardManager={ethCardManager}
      dcAccountManager={dcAccountManager}
      dcCardManager={dcCardManager}
      dcGatewayManager={dcGatewayManager}
    />
  )

  const BuildDAppChainCards = () => (
    <DAppChainCards
      ethAccountManager={ethAccountManager}
      ethCardManager={ethCardManager}
      ethGatewayManager={ethGatewayManager}
      dcAccountManager={dcAccountManager}
      dcCardManager={dcCardManager}
      dcGatewayManager={dcGatewayManager}
    />
  )

  ReactDOM.render(
    <Router>
      <div>
        <header>
          <BuildMain />
        </header>

        <main role="main" style={{ marginTop: 100 }}>
          <div className="container">
            <Route exact path="/" component={BuildHome} />
            <Route path="/eth_cards" component={BuildEthCards} />
            <Route path="/gateway_cards" component={BuildGatewayCards} />
            <Route path="/dappchain_cards" component={BuildDAppChainCards} />
          </div>
        </main>
      </div>
    </Router>,
    document.getElementById('root')
  )
})()
