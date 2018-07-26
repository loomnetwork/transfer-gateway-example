import Web3 from 'web3'

export default class EthAccountManager {
  static async createAsync() {
    const browserWeb3 = new Web3(window.web3.currentProvider)
    const ethAccountManager = new EthAccountManager(browserWeb3)
    let userAccount = await ethAccountManager.getCurrentAccountAsync()
    setInterval(async () => {
      // Check if account has changed
      const account = await ethAccountManager.getCurrentAccountAsync()
      if (account !== userAccount) {
        userAccount = account
        // Call some function to update the UI with the new account
        location.reload()
      }
    }, 100)

    return ethAccountManager
  }

  constructor(browserWeb3) {
    this.browserWeb3 = browserWeb3
  }

  async getCurrentAccountAsync() {
    const account = await this.browserWeb3.eth.getAccounts()
    return account[0]
  }
}
