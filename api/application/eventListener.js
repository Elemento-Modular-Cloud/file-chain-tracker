const Web3 = require('web3')
const web3 = new Web3('https://your.ethereum.node')

const contractAddress = 'your_contract_address'
const contractABI = []
const contract = new web3.eth.Contract(contractABI, contractAddress)

// Listen for VolumeAdded events
contract.events.VolumeAdded({
  fromBlock: 'latest'
}, function (error, event) {
  if (error) {
    console.error(error)
  } else {
    console.log('VolumeAdded event:', event.returnValues)
  }
})

// Listen for VolumeUpdated events
contract.events.VolumeUpdated({
  fromBlock: 'latest'
}, function (error, event) {
  if (error) {
    console.error(error)
  } else {
    console.log('VolumeUpdated event:', event.returnValues)
  }
})
