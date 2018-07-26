// const { readFileSync } = require('fs')
// const Web3 = require('web3')

// const {
//   NonceTxMiddleware, SignedTxMiddleware, Client, Address,
//   LocalAddress, CryptoUtils, AddressMapper, Web3Signer, createJSONRPCClient
// } = require('loom-js')

// const GameTokenDAppChain = artifacts.require('GameTokenDAppChain')

    // deployer.deploy(Gateway, [accounts[9]], 3, 4).then(async () => {

    //   const privateKey = readFileSync('../dappchain/private_key', 'utf-8')
    //   const publicKey = CryptoUtils.publicKeyFromPrivateKey(CryptoUtils.B64ToUint8Array(privateKey))

    //   const chainId  = 'default'
    //   const writeUrl = 'http://127.0.0.1:46658/rpc'
    //   const readUrl  = 'http://127.0.0.1:46658/query'

    //   const writer = createJSONRPCClient({ protocols: [{ url: writeUrl }] })
    //   const reader = createJSONRPCClient({ protocols: [{ url: readUrl }] })
    //   const client = new Client(chainId, writer, reader)

    //   // required middleware
    //   client.txMiddleware = [
    //     new NonceTxMiddleware(publicKey, client),
    //     new SignedTxMiddleware(privateKey)
    //   ]

    //   const web3 = new Web3(this.web3.currentProvider)

    //   const addressMapper = await AddressMapper.createAsync(
    //     client,
    //     new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
    //   )

    //   const gatewayInstance = await Gateway.deployed()
    //   console.log(`Gateway deployed at address: ${gatewayInstance.address}`)
