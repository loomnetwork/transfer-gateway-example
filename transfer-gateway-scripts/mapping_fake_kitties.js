const {readFileSync} = require('fs');
const Web3 = require('web3');

const{
    NonceTxMiddleware, SignedTxMiddleware, Client,
    Address, Contracts, LocalAddress, CryptoUtils, 
    createJSONRPCClient, Web3Signer, soliditySha3
} = require('loom-js');


console.log("Hello! I'll be mapping the Fake Kitties!");

function readStoredData(filename){
    return readFileSync("../" + filename, 'utf-8')
}

function getKeyPair(){
    let privateKeyData = readStoredData('dappchain/private_key');
    let privateKey = CryptoUtils.B64ToUint8Array(privateKeyData);
    let publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    return {'public':publicKey, 'private':privateKey};
}

function createLoomClient(chainId, writeUrl, readUrl){
    const writer = createJSONRPCClient({protocols: [{url: writeUrl}]});
    const reader = createJSONRPCClient({protocols: [{url: readUrl}]});
    return new Client(chainId, writer, reader);
}

function injectMiddleware(client, keypair){
    client.txMiddleware = [
        new NonceTxMiddleware(keypair['public'], client),
        new SignedTxMiddleware(keypair['private'])
    ]
}

// ADDRESSES
const fakeKittyEthAddress = readStoredData('fake_kitty_eth_address');
const fakeKittyLoomAddress = readStoredData('fake_kitty_loom_address')
const fakeKittyEthTx = readStoredData('fake_kitty_tx_hash');

// NETWORK CONFIG
const chainId = 'default';
const writeUrl = 'http://127.0.0.1:46658/rpc';
const readUrl = 'http://127.0.0.1:46658/query';

// console.log("fakeKittyEthAddress", fakeKittyEthAddress);
// console.log("fakeKittyLoomAddress", fakeKittyLoomAddress);
// console.log("fakeKittyEthTx", fakeKittyEthTx);

(async () => {
    // set up keypair
    let keypair = getKeyPair();
    const publicKey = keypair['public'];
    const privateKey = keypair['private'];

    // initialize client that talks with loom (could be one call ex .setupClient)
    const client = createLoomClient(chainId, writeUrl, readUrl);
    injectMiddleware(client, keypair);

    // what is this exactly?? be able to describe it more
    // is it the local loom address? 
    let localAddress = new Address(client.chainId, LocalAddress.fromPublicKey(publicKey));
    console.log("localAddress");
        
    const transferGateway = await Contracts.TransferGateway.createAsync(client,localAddress);

    console.log('transferGateway', transferGateway);

    const ethContractAddress = new Address('eth', LocalAddress.fromHexString(fakeKittyEthAddress));

    const loomContractAddress = new Address(client.chainId, LocalAddress.fromHexString(fakeKittyLoomAddress))

    console.log("ethContractAddress", ethContractAddress);
    console.log("loomContractAddress", loomContractAddress);

})()
