pragma solidity 0.4.24;

contract SimpleStake {
  mapping (address => uint256) balance;

  function stake() external payable {
    require(msg.value > 0, "Amount staked should be greater than 0");
    balance[msg.sender] = msg.value;
  }

  function unstake() external {
    uint256 total = balance[msg.sender];
    require(total > 0, "No value staked to unstake");
    balance[msg.sender] = 0;
    msg.sender.transfer(total);
  }
  
  function balanceOf(address account) public view returns(uint256) {
    return balance[account];
  }
}