import Web3 from 'web3';

export default class EthNDCraftingManager {
    static async createAsync(){
        const browserWeb3 = new Web3(window.web3.currentProvider);
        const networkId = await browserWeb3.eth.net.getId()
        const contract = new browserWeb3.eth.Contract(
            ND_CRAFTING_JSON.abi,
            DC_ND_CRAFTING_JSON.networks[networkId].address
        )
        console.log("contract", contract);
        console.log("NeonDistrictCrafting", NeonDistrictCrafting);

        return new EthNDCraftingManager(contract);
    }

    constructor(contract){
        this._contract = contract;
    }

    async getAssetWithId(id){
        // await contract.
        // fetch asset here
    }
}
