// a straight copy from Cardlist, for understanding
import Web3 from 'web3';
import FakeKittyList from '../fake_kitty_list';

export default class EthFakeKittyManager {
    static async createAsync(){
        console.log("hey, in EthFakeKittyManager createAsync");
        const browserWeb3 = new Web3(window.web3.currentProvider);
        const networkId = await browserWeb3.eth.net.getId()
        const contract = new browserWeb3.eth.Contract(
            FAKE_CRYPTO_KITTY_JSON.abi,
            FAKE_CRYPTO_KITTY_JSON.networks[networkId].address
        )

        return new EthFakeKittyManager(contract);
    }

    constructor(contract){
        this._contract = contract;
    }

    getFakeKittyWithId(kittyId){
        return FakeKittyList[kittyId];
    }

    getContractAddress(){
        return this._contract.options.address;
    }

    async getBalanceOfUserAsync(address){
        return await this._contract.methods.balanceOf(address).call({from:address});
    }

    async getFakeKittiesOfUserAsync(address,balance){
        const total = await this._contract.methods.totalSupply().call()
        let ids = [];
        for(let i=0; i< total; i++){
            if(i>= balance){
                break;
            }
            const kittyId = await this._contract.methods
            .tokenOfOwnerByIndex(address,i)
            .call({from:address})
            if(kittyId !== 0){
                ids.push(kittyId);
            }
        }
        return ids;
    }

    async depositFakeKittyOnGateway(address,kittyId){
        return await this._contract.methods
        .depositToGateway(kittyId)
        .send({from:address, gas: '219362'})
    }
}

