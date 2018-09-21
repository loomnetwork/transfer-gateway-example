pragma solidity ^0.4.24;
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './ERC20Adapter.sol';
import './ERC1155Spike.sol';
import './ERCAdaptable.sol';

contract NeonDistrictCraftingDappChain is ERC1155Spike, ERCAdaptable {
    using SafeMath for uint256;
    address public gatewayContract;

    event CraftAttempted(address indexed _from, 
                         uint256 indexed _craftAttemptIdx, 
                         uint256[] _typeIds, 
                         uint256[] _values);

    event CraftSucceeded(uint256 _craftedAssetClassIdx, 
                         uint256 _craftedAt, 
                         address _issuedTo, 
                         uint256 _craftAttemptIdx, 
                         uint256 _whichMintedAssetId);

    // status is  0|1|2 (PENDING | SUCCESS | FAILURE) 
    // TODO make an actual enum
    struct CraftAttempt {
        address from;
        uint status;
        uint256[] inputAssetClassIndexes;
        uint256[] inputAssetClassValues;
        uint _attemptedDate;
        uint _settledDate;
        uint256 whichMintedAssetId;
    }

    uint256 public craftAttemptIdx = 0;                           // the last craftAttempt (needed?)
    mapping (uint256 => uint256) public craftedAssetClasss;      // whichAssetIdToCraftAttemptId
    mapping (uint256 => CraftAttempt) public craftAttempts;

    // allow an owner to set a gateway in order
    // to not change the signature of the constructor
    // for now. Will call this directly in migrations
    // TODO, ultimately could make this part of the constructor
    // once we sort out what's working & what's not
    function setGateway(address _gatewayContract) public onlyOwner {
        gatewayContract = _gatewayContract;
    }

    // TODO accept a blueprint (a fungible?)
    // @param _ids is list of input ids
    // @param _values the amt of each id
    function attemptCraft(uint[] _ids, 
                          uint[] _values) 
      external
    {
        uint _id; 
        uint _value;  

        for (uint i = 0; i < _ids.length; i++) {
            _id = _ids[i];
            _value = _values[i];

            // TODO require sender owns the input assets in the right amounts

            if( isNonFungible(_id) ){
                require(_value == 1);
                require(nfiOwners[_id] == msg.sender);
            }
            uint256 _typeId = typeIdFor(_id);

            assets[_typeId].balances[msg.sender] = assets[_typeId].balances[msg.sender].sub(_value);
            assets[_typeId].escrowBalances[msg.sender] = assets[_typeId].escrowBalances[msg.sender].add(_value);
        }

        ++craftAttemptIdx; 
        craftAttempts[craftAttemptIdx] = CraftAttempt(msg.sender,0, _ids, _values, now, 0, 0); 
        emit CraftAttempted(msg.sender, craftAttemptIdx, _ids, _values); 
    }

    // @param _craftAssetClassIdx which class of item are we issuing?
    // @param _craftAttemptIdx which craft attempt is this referencing?
    // function ND to call after a successful craft attempt: issues new item to player
    // _craftAssetClassIdx comes from ND server; they know which item the craftAttempt results in
    function issueCraftAssetClass(uint256 _craftAssetClassIdx, 
                                  uint256 _craftAttemptIdx) 
        public 
        onlyOwner 
        returns(uint256 _whichId)
    {

        // TODO check status and not settled yet
        CraftAttempt memory ca = craftAttempts[_craftAttemptIdx];
        uint _typeId = _craftAssetClassIdx;

        _whichId = mintSingleNonFungible(_typeId, ca.from, 0);

        craftedAssetClasss[_whichId] = _craftAttemptIdx;

        // UPDATE craftAttempt
        craftAttempts[_craftAttemptIdx].status = 1;
        craftAttempts[_craftAttemptIdx]._settledDate = now;

        // ADDS items to children for _whichId
        // ADDS parent to children
        for(uint i=0; i< ca.inputAssetClassIndexes.length; i++){
            // this is a typeId
            children[_whichId].ids.push(ca.inputAssetClassIndexes[i]);
            children[_whichId].countEscrowed.push(ca.inputAssetClassValues[i]);
            // TODO add NFTs to parent
        }
        emit CraftSucceeded(_craftAssetClassIdx, now, ca.from, _craftAttemptIdx, _whichId);
    }

    // @param idx of craft attempt 
    // Function ND to call after a failed craft attempt
    function issueCraftFailure(uint256 _craftAttemptIdx) 
        public 
        onlyOwner 
        returns (bool)
    {
        uint _typeId;
        uint _value;
        CraftAttempt memory ca = craftAttempts[_craftAttemptIdx];
        uint numInputs = ca.inputAssetClassIndexes.length;

        // TODO check player owns assets
        // TODO should be whichID
        for(uint i=0; i < numInputs; ++i){
            _typeId = ca.inputAssetClassIndexes[i];
            _value = ca.inputAssetClassValues[i];
            // TODO do we need to remove from children and parent
            assets[_typeId].balances[ca.from] =  assets[_typeId].balances[ca.from].add(_value); 
            assets[_typeId].escrowBalances[ca.from] =  assets[_typeId].escrowBalances[ca.from].sub(_value); 
        }
        craftAttempts[_craftAttemptIdx].status = 2;
        return true;
    }

    // @param this is the id that represents a specific nft 
    // break an asset into its constituent parts
    // NOTE if we use this implementation equipment cores will be different
    function decompose(uint256 _id) 
        public 
        returns(bool)
    {
        uint childId;
        uint childBal;

        uint256 _typeId = typeIdFor(_id); 

        require (balanceOf(_typeId, msg.sender) >= 1); 
        require (nfiOwners[_id] == msg.sender);

        // decrement balance for this type
        assets[_typeId].balances[msg.sender] = assets[_typeId].balances[msg.sender].sub(1);
        assets[_typeId].totalSupply = assets[_typeId].totalSupply.sub(1);
        
        uint _craftAttemptIdx = craftedAssetClasss[_id];
        delete craftedAssetClasss[_id];

        CraftAttempt memory ca = craftAttempts[_craftAttemptIdx];
        for(uint i=0; i < ca.inputAssetClassIndexes.length; i++){
            childId = ca.inputAssetClassIndexes[i];
            childBal = ca.inputAssetClassValues[i];

            uint256 _childTypeId = typeIdFor(childId);

            assets[_childTypeId].escrowBalances[msg.sender] = assets[_childTypeId].escrowBalances[msg.sender].sub(childBal); 

            assets[_childTypeId].balances[msg.sender] = assets[_childTypeId].balances[msg.sender].add(childBal); 

            // remove parent reference for each item
        }
    }

    // TODO: I like balances struct better than two arrays
    function escrowBalanceOf(uint256 _typeId, 
                             address _owner) 
        public view 
        returns (uint256)
    {
        return assets[_typeId].escrowBalances[_owner];
    }

    // @param _id the id of a specific nft
    // abstraction around the ingredients in an item, used in decomposition
    function itemChildren(uint256 _id) 
        public 
        view 
        returns(uint[] ids, 
                uint[] balances)
    {
        // TODO require item exists 
        ids = craftAttempts[craftedAssetClasss[_id]].inputAssetClassIndexes;
        balances = craftAttempts[craftedAssetClasss[_id]].inputAssetClassValues;
    }

    // @param _craftAttemptIdx index of a craft attempt
    // returns ids item ids you crafted with 
    // returns balances the amount of each item you submit to craft
    function getCraftIngredients(uint256 _craftAttemptIdx)
        public
        view
        returns(uint[] ids, uint[] balances)
    {
        ids = craftAttempts[_craftAttemptIdx].inputAssetClassIndexes;
        balances = craftAttempts[_craftAttemptIdx].inputAssetClassValues;
    }


} 
// TODO make a table in the README explaining ids and whichIds
