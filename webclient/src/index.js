import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Main from './components/main'
import Home from './components/home'

import EthAccountManager from './eth_managers/eth_account_manager'
import DAppChainAccountManager from './dc_managers/dc_account_manager'

import EthCardManager from './eth_managers/eth_card_manager'
import DAppChainCardManager from './dc_managers/dc_card_manager'

import EthFakeKittyManager from './eth_managers/eth_fake_kitty_manager'

import EthGatewayManager from './eth_managers/eth_gateway_manager'
import DAppChainGatewayManager from './dc_managers/dc_gateway_manager'

import EthTokenManager from './eth_managers/eth_token_manager'
import DAppChainTokenManager from './dc_managers/dc_token_manager'

import EthTokens from './components/eth_tokens'
import DAppChainTokens from './components/dappchain_tokens'
import GatewayTokens from './components/gateway_tokens'
;(async () => {
  console.log('Loading ...')
  const t = setTimeout(
    () =>
      console.log(
        '\n\n----> If this takes too long to start, please try to reset MetaMask cache :)'
      ),
    5000
  )

  const ethAccountManager = await EthAccountManager.createAsync()
  const dcAccountManager = await DAppChainAccountManager.createAsync()

  const ethCardManager = await EthCardManager.createAsync()
  const dcCardManager = await DAppChainCardManager.createAsync()

    // fake kitty stuff
    const ethFakeKittyManager = await EthFakeKittyManager.createAsync();
    // end fake kitty stuff

  const ethTokenManager = await EthTokenManager.createAsync()
  const dcTokenManager = await DAppChainTokenManager.createAsync()

  const ethGatewayManager = await EthGatewayManager.createAsync()
  const dcGatewayManager = await DAppChainGatewayManager.createAsync()

  clearTimeout(t)

  const BuildMain = () => (
    <Main
      ethAccountManager={ethAccountManager}
      ethCardManager={ethCardManager}
      ethFakeKittyManager={ethFakeKittyManager}
      dcAccountManager={dcAccountManager}
      dcCardManager={dcCardManager}
    />
  )

  const BuildHome = () => (
    <Home 
      ethAccountManager={ethAccountManager} 
      dcAccountManager={dcAccountManager} 
     />
  )

    // ok this is where we set default props for EthTokens
  const BuildEthTokens = () => (
    <EthTokens
      ethGatewayManager={ethGatewayManager}
      ethAccountManager={ethAccountManager}
      ethFakeKittyManager={ethFakeKittyManager}
      dcAccountManager={dcAccountManager}
      ethCardManager={ethCardManager}
      dcCardManager={dcCardManager}
      ethTokenManager={ethTokenManager}
      dcTokenManager={dcTokenManager}
    />
  )

  const BuildGatewayTokens = () => (
    <GatewayTokens
      ethAccountManager={ethAccountManager}
      dcAccountManager={dcAccountManager}
      ethCardManager={ethCardManager}
      dcCardManager={dcCardManager}
      ethFakeKittyManager={ethFakeKittyManager}
      ethTokenManager={ethTokenManager}
      dcTokenManager={dcTokenManager}
      ethGatewayManager={ethGatewayManager}
      dcGatewayManager={dcGatewayManager}
    />
  )

  const BuildDAppChainTokens = () => (
    <DAppChainTokens
      ethAccountManager={ethAccountManager}
      dcAccountManager={dcAccountManager}
      ethCardManager={ethCardManager}
      ethFakeKittyManager={ethFakeKittyManager}
      dcCardManager={dcCardManager}
      ethTokenManager={ethTokenManager}
      dcTokenManager={dcTokenManager}
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
            <Route path="/eth" component={BuildEthTokens} />
            <Route path="/gateway" component={BuildGatewayTokens} />
            <Route path="/dappchain" component={BuildDAppChainTokens} />
          </div>
        </main>
      </div>
    </Router>,
    document.getElementById('root')
  )
})()
