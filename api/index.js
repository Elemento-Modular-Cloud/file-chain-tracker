const express = require('express')
const cors = require('cors')
const { Web3 } = require('web3')
const path = require('path')
const { v4 } = require('uuid')

const app = express()
const port = 3030
app.use(express.json())
app.use(cors({ origin: '*' }))

// my wallet address
const privateKey = '0x242a37cd5c5e70c9191fcdfa8a0250004a48220fc1fa97b00a77c66672712d94'

// Initialize Web3
const web3 = new Web3('http://127.0.0.1:7545') // Replace with your Ethereum node URL
const contractAddress = '0x26e63430850F51356409412D43Fca3743310d492' // Replace with your contract address
const { abi } = require(path.join(__dirname, '../contract/build/contracts/EBVT.json'))

const contract = new web3.eth.Contract(abi, contractAddress)

app.get('/list', async (req, res) => {
  try {
    const rawVolumes = await contract.methods.listLatestVolumes().call()
    const volumes = rawVolumes.map(volume => {
      return {
        id: volume.id,
        ip: volume.ip,
        name: volume.name,
        owner: volume.owner,
        timestamp: Number(volume.timestamp),
        checksum: volume.checksum
      }
    })
    res.json(volumes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'An error occurred while fetching the latest volumes' })
  }
})

// Route to insert a new volume
app.post('/create', async (req, res) => {
  const { name, ip, owner, checksum } = req.body

  const id = v4()

  try {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey)
    const gasLimit = 500000 // Adjust as needed

    const txObject = {
      from: account.address,
      to: contractAddress,
      data: contract.methods.insertVolume(id, name, ip, owner, checksum).encodeABI(),
      gas: gasLimit,
      gasPrice: web3.utils.toWei('10', 'gwei')
    }

    const gas = await web3.eth.estimateGas(txObject)
    console.log('Estimated Gas:', gas)

    if (Number(gas) > gasLimit) {
      txObject.gas = Number(gas)
    }

    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey)
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

    // Convert BigInt fields to strings in the receipt
    const parsedReceipt = {
      transactionHash: receipt.transactionHash,
      transactionIndex: Number(receipt.transactionIndex),
      blockHash: receipt.blockHash,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: Number(receipt.gasUsed),
      cumulativeGasUsed: Number(receipt.cumulativeGasUsed),
      contractAddress: receipt.contractAddress || '',
      logs: receipt.logs.map(log => {
        return {
          address: log.address,
          blockHash: log.blockHash,
          blockNumber: Number(log.blockNumber),
          data: log.data,
          logIndex: Number(log.logIndex),
          removed: log.removed,
          transactionHash: log.transactionHash,
          transactionIndex: Number(log.transactionIndex)
        }
      }),
      status: Number(receipt.status)
    }

    console.log('Transaction receipt:', parsedReceipt)
    res.json({ success: true, receipt: parsedReceipt })
  } catch (error) {
    if (error && error.cause && error.cause.message) {
      console.error('Error inserting volume:', error.cause.message)
      res.status(500).json({ error: error.cause.message })
    } else {
      res.status(500).json({ error: 'General error', stack: error.message })
    }
  }
})

app.get('/mount', (req, res) => {
  res.json({ message: 'Mount successful' })
})

app.get('/unmount', (req, res) => {
  res.json({ message: 'Unmount successful' })
})

app.post('/data', (req, res) => {
  const inputData = req.body
  console.log(inputData)

  res.json({ message: 'Data received', data: inputData })
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
