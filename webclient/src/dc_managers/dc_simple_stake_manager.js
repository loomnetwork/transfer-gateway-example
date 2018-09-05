import Web3 from 'web3'

import { CryptoUtils, Client, LoomProvider } from 'loom-js/dist'

export default class DAppChainSimpleStakeManager {
  static async createAsync() {
    const privateKey = CryptoUtils.B64ToUint8Array(
      'ZGTsP8LUJkEWiqEZq3hqOKfCHCeV+CbYgbZK2/y53aDAaCJPBla4uLTsEtzm/Dczk8Ml8TL5+rAwKNfbuRZihg=='
    )

    const client = new Client(
      'default',
      'ws://127.0.0.1:46658/websocket',
      'ws://127.0.0.1:46658/queryws'
    )

    const loomProvider = new LoomProvider(client, privateKey)

    const browserWeb3 = new Web3(loomProvider)
    const networkId = await browserWeb3.eth.net.getId()
    const contract = new browserWeb3.eth.Contract(
      DC_SIMPLE_STAKE.abi,
      DC_SIMPLE_STAKE.networks[networkId].address
    )

    return new DAppChainSimpleStakeManager(contract)
  }

  constructor(contract) {
    this._contract = contract
  }

  async stake(address, amount) {
    await this._contract.methods.stake().send({
      from: address,
      value: amount
    })
  }

  async unstake(address) {
    await this._contract.methods.unstake().send({
      from: address
    })
  }

  async balanceOf(address) {
    return await this._contract.methods.balanceOf(address).call({ from: address })
  }
}
