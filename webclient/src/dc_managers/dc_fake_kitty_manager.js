import Web3 from 'web3'

const{
    NonceTxMiddleware,
    SignedTxMiddleware,
    Client,
    LocalAddress,
    Address,
    CryptoUtils,
    LoomProvider
} = require('loom-js/dist')

import FakeKittyList from '../fake_kitty_list'

export default class DAppChainFakeKittyManager {
    static async createAsync(){
        // hard-coded in this demo
        // and am assuming it's the pk of the account
        // we import into mm. 
        const privateKey = CryptoUtils.B64ToUint8Array(
          'ZGTsP8LUJkEWiqEZq3hqOKfCHCeV+CbYgbZK2/y53aDAaCJPBla4uLTsEtzm/Dczk8Ml8TL5+rAwKNfbuRZihg=='
        )

        const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

        console.log("privateKey", privateKey);
        console.log("publicKey", publicKey);

        // loom client
        const client = new Client(
            'default',
            'ws://127.0.0.1:46658/websocket',
            'ws://127.0.0.1:46658/queryws'
        )

        client.txMiddleware = [
            new NonceTxMiddleware(publicKey, client),
            new SignedTxMiddleware(privateKey)
        ]

        const from = LocalAddress.fromPublicKey(publicKey).toString()
        console.log("from", from);
        const web3 = new Web3(new LoomProvider(client,privateKey))

        const networkId = await web3.eth.net.getId()


        client.on('error', msg => {
            console.error('Error on connect to client', msg);
            console.warn('please verify if loom is running')
        })

        console.log("networkId", networkId);
        console.log("FAKE_CRYPTO_KITTY_JSON networks", FAKE_CRYPTO_KITTY_JSON.networks)
        console.log("DC_FAKE_CRYPTO_KITTY_JSON networks", DC_FAKE_CRYPTO_KITTY_JSON.networks)
        console.log("DC_CRYPTO_CARDS_JSON networks" , DC_CRYPTO_CARDS_JSON.networks)

        console.log("---");
        const contract = new web3.eth.Contract(
            DC_FAKE_CRYPTO_KITTY_JSON.abi,
            DC_FAKE_CRYPTO_KITTY_JSON.networks[networkId].address,
            { from }
        )
        console.log("contract", contract);

        return new DAppChainFakeKittyManager(client,contract,web3)

    }

    constructor(client, contract, web3){
        this._client = client;
        this._contract = contract;
        this._web3 = web3;
    }

    getContractAddress(){
        // assume this is the contract address of the fake kitties on loom
        return this._contract.options.address;
    }

    getFakeKittyWithId(fkid){
        return FakeKittyList[fkid];
    }

    async getBalanceOfUserAsync(address){
        return await this._contract.methods.balanceOf(address).call({from:address})
    }

    // still gotta work through my own understanding of this logic
    async getFakeKittiesOfUserAsync(address, balance){
        // get all of them (count)
        const total = await this._contract.methods.totalSupply().call()
        let ids = []
        for(let i = 0; i < total; i++){
            //(only count upto how many the user hasto how many the user has)
            //note this assumes the ids are ints..
            //which will not map in our crazy world
            if (i>=balance){
                break
            }

            // look up the ith kitty for the owner
            const kittyId = await this._contract.methods
                .tokenOfOwnerByIndex(address, i)
                .call({from: address})

            if(kittyId !== 0){
                ids.push(kittyId)
            }
        }
        return ids;
    }

    async approveAsync(senderAddress, kittyId){
        // saying the gateway contract has permission to transfer the kittyId
        // still not clear who the senderAddress is: it is the loom address of the token owner
        // the account that owns the token on loom is giving the gateway permission to transfer it
        // which... approves a specific account for asset withdrawal
        // In 721 speak, a global variable, tokenApprovals, maps a token index or id to an senderAddress that is approved to transfer it.
        console.log("in approveAsync in dc_fake_kitty_manager, with kittyId", kittyId, "and senderAddress", senderAddress);
        // same notes as in the dc_card_manager
        const gatewayAddress = this._web3.utils.toChecksumAddress('0xC5d1847a03dA59407F27f8FE7981D240bff2dfD3')
        const iban = this._web3.eth.Iban.toIban(gatewayAddress)

        // this wraps the 721 approve method
        return await this._contract.methods.approve(gatewayAddress,kittyId).send({from: senderAddress})
    }

}
