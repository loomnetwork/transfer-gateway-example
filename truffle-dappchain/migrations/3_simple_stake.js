const { writeFileSync } = require('fs')
const SimpleStake = artifacts.require('./SimpleStake.sol')

module.exports = deployer => {
  deployer.deploy(SimpleStake).then(async () => {
    const SimpleStakeInstance = await SimpleStake.deployed()
    console.log(`SimpleStake deployed at address: ${SimpleStakeInstance.address}`)
    writeFileSync('../simple_stake_address', SimpleStakeInstance.address)
  })
}
