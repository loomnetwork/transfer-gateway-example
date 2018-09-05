// outside packages: fs, web3, loom
const { readFileSync } = require('fs')
const Web3 = require('web3')

const {
  NonceTxMiddleware, SignedTxMiddleware, Client, Address, Contracts,
  LocalAddress, CryptoUtils, createJSONRPCClient, Web3Signer, soliditySha3
} = require('loom-js')

// application specific data, these are addresses and tx hashes were written during the migrations
const cryptoCardsAddress = readFileSync('../crypto_cards_address', 'utf-8')
const cryptoCardsDAppChainAddress = readFileSync('../crypto_cards_dappchain_address', 'utf-8')
const cryptoCardsTx = readFileSync('../crypto_cards_tx_hash', 'utf-8')


;(async () => {
    // this keypair included in the reference implementation  (using CryptoUtils from loom-js)
    // keypair(privateKey, publicKey) = getKeys()
  const privateKey = CryptoUtils.B64ToUint8Array(readFileSync('../dappchain/private_key', 'utf-8'))
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey)

    // loom config
    // createClient(chainId, writeUrl, readUrl)
  const chainId  = 'default'
  const writeUrl = 'http://127.0.0.1:46658/rpc'
  const readUrl  = 'http://127.0.0.1:46658/query'

    // create a loom client that can read & write to the loom network (Client & createJSONRPCClient from loom-js)
  const writer = createJSONRPCClient({ protocols: [{ url: writeUrl }] })
  const reader = createJSONRPCClient({ protocols: [{ url: readUrl }] })
  const client = new Client(chainId, writer, reader)

  console.log(': Client created is: ', client)

  // required middleware, (packages from loom-js)
    // addMiddleware(client, keypair)
  client.txMiddleware = [
    new NonceTxMiddleware(publicKey, client),
    new SignedTxMiddleware(privateKey)
  ]

    // initialize loomjs dappchain gateway (Contracts, Address & LocalAddress from loom-js)
    //  transferGateway = createGateway(client, keypair)
  const transferGateway = await Contracts.TransferGateway.createAsync(
    client,
    new Address(client.chainId, LocalAddress.fromPublicKey(publicKey))
  )

  console.log(': Transfer Gateway client created is: ', transferGateway)

    // going with 'foreign' means mainnet & 'local' means dappchain? 
    // LocalAddress from loom-js
    // foreignContract = createEthAddress(cryptoCardsAddress)
    // localContract = createDappAddress(client, cryptoCardsDAppChainAddress)
  const foreignContract = new Address('eth', LocalAddress.fromHexString(cryptoCardsAddress))
  const localContract = new Address(
    client.chainId, LocalAddress.fromHexString(cryptoCardsDAppChainAddress)
  )

    console.log(": foreignContract is: ", foreignContract);
    console.log(": localContract is: ", localContract);

    // hardcoded to reference implementation ganache-cli
  const web3 = new Web3('http://localhost:8545')
  const accounts = await web3.eth.getAccounts()
  const owner = accounts[0]

  console.log(': Account used for sign is: ', owner)

    // sign some shit
    // hash = create
  const web3Signer = new Web3Signer(web3, owner)
    // https://web3js.readthedocs.io/en/1.0/web3-utils.html#soliditysha3
    // Will calculate the sha3 of given input parameters in the same way solidity would. 
    // This means arguments will be ABI converted and tightly packed before being hashed.
    // soliditySha3 from loom-js, wraps from web3.utils
    // hashing the local address of the foreignContract (eth) and the local contract (loom)
  const hash = soliditySha3(
    { type: 'address', value: foreignContract.local.toString().slice(2) },
    { type: 'address', value: localContract.local.toString().slice(2) }
  )
    console.log(": hash is: ", hash);


    // sign with the hash of the eth & loom addresses -- not yet sure why
  const foreignContractCreatorSig = await web3Signer.signAsync(hash)

  console.log(`Sign foreign contract and local contracts ${cryptoCardsAddress} ${cryptoCardsDAppChainAddress}`)

    // Buffer == a node thing
    // is the creator in the tx hash starting at 2?
  const foreignContractCreatorTxHash = Buffer.from(cryptoCardsTx.slice(2), 'hex')

    console.log(": cryptoCardsTx.slice(2) is : ", cryptoCardsTx.slice(2));
    console.log(": cryptoCardsTx is : ", cryptoCardsTx);
    console.log(": foreignContractCreatorTxHash is: ", foreignContractCreatorTxHash);
//cryptoCardsTx:  0x1a10e5eb138b42c7ecc58994eb92c99fb837b55b2e2cca1084bdb0ee2250e6cd
//foreignContractCreatorTxHash:  <Buffer 1a 10 e5 eb 13 8b 42 c7 ec c5 89 94 eb 92 c9 9f b8 37 b5 5b 2e 2c ca 10 84 bd b0 ee 22 50 e6 cd>


    // create a mapping between two contracts with the creator & the tx sig
  await transferGateway.addContractMappingAsync({
    foreignContract,
    localContract,
    foreignContractCreatorSig,
    foreignContractCreatorTxHash
  })
})()
