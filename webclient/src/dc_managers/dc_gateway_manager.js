import BN from 'bn.js'

import {
  Contracts,
  CryptoUtils,
  Client,
  NonceTxMiddleware,
  SignedTxMiddleware,
  Address,
  LocalAddress
} from 'loom-js/dist'

export default class DAppChainGatewayManager {
  static async createAsync() {
    const privateKey = CryptoUtils.B64ToUint8Array(
      'ZGTsP8LUJkEWiqEZq3hqOKfCHCeV+CbYgbZK2/y53aDAaCJPBla4uLTsEtzm/Dczk8Ml8TL5+rAwKNfbuRZihg=='
    )

    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)

    const client = new Client(
      'default',
      'ws://127.0.0.1:46658/websocket',
      'ws://127.0.0.1:46658/queryws'
    )

    // required middleware
    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ]

      // think TransferGateway is part of the loom-dist
      // as in Contracts
      // BOOM
      // https://github.com/loomnetwork/loom-js/tree/master/src/contracts
    const transferGateway = await Contracts.TransferGateway.createAsync(
      client,
      new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
    )

    return new DAppChainGatewayManager(transferGateway, client)
  }

  constructor(transferGateway, client) {
      // in case I forgot, this is the transferGateway from the loom-js distro
    this._transferGateway = transferGateway
    this._client = client

    this._transferGateway.on(Contracts.TransferGateway.EVENT_TOKEN_WITHDRAWAL, event => {
      if (this._onTokenWithdrawal) {
        this._onTokenWithdrawal(event)
      }
    })
  }

  onTokenWithdrawal(fn) {
    this._onTokenWithdrawal = fn
  }

    // these withdraw methods i think need one more piece of info
    // which is beyond what type of token (eth, 20, 721), what KIND of token (0x, CryptoKitty, FakeCrytoKitty), etc)
    // who is the contractAddress
  async withdrawCardAsync(cardId, contractAddress) {
      console.log("in withdrawCardAsync with cardId", cardId, " and contractAddress", contractAddress);
      console.log("this._transferGateway", this._transferGateway);

      // note this next line is called from the loom library here
      // https://github.com/loomnetwork/loom-js/blob/f0df59fc58e1a15f7bfeee96565d8d828e335796/src/contracts/transfer-gateway.ts#L125
    let result = await this._transferGateway.withdrawERC721Async(
      new BN(cardId),
      new Address(this._client.chainId, LocalAddress.fromHexString(contractAddress))
    )

      console.log("withdrawCardAsync: result from transferGateway.withdrawERC721Async", result);
      return result;
  }

    //https://github.com/loomnetwork/loom-js/blob/f0df59fc58e1a15f7bfeee96565d8d828e335796/src/contracts/transfer-gateway.ts#L125
    async withdrawFakeKittyAsync(fkid, contractAddress){
        console.log("in withdrawFakeKittyAsync with fkid", fkid, " and contract addr", contractAddress);
        console.log("this._transferGateway", this._transferGateway);

        // as above, this is calling a method in the loom-library
        let result = await this._transferGateway.withdrawERC721Async(
            new BN(fkid),
            new Address(this._client.chainId, LocalAddress.fromHexString(contractAddress))
        )
      console.log("withdrawFakeKittyAsync: result from transferGateway.withdrawERC721Async", result);
        return result;
    }

  async withdrawTokenAsync(amount, contractAddress) {
    return await this._transferGateway.withdrawERC20Async(
      new BN(amount),
      new Address(this._client.chainId, LocalAddress.fromHexString(contractAddress))
    )
  }

  async withdrawalReceiptAsync(address) {
      // what is this address
      console.log("withdrawalReceiptAsync with address", address);
      // who is the _transferGateway? it's gotta be another loom class
    return await this._transferGateway.withdrawalReceiptAsync(
      new Address(this._client.chainId, LocalAddress.fromHexString(address))
    )
  }

  async withdrawEthAsync(amount) {
    return await this._transferGateway.withdrawETHAsync(
      new BN(amount),
      new Address(
        this._client.chainId,
        LocalAddress.fromHexString('0xf5cAD0DB6415a71a5BC67403c87B56b629b4DdaA')
      )
    )
  }
}
