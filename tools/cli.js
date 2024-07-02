import fs from 'fs'
import path from 'path'
import { create } from 'apisauce'
import inquirer from 'inquirer'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const api = create({
  baseURL: 'http://localhost:3030'
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// local database
const dbFilePath = path.join(__dirname, 'db.json')

// ensure the data directory exists
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir)
}

// read the database file or initialize an empty object
let db = {}
if (fs.existsSync(dbFilePath)) {
  const dbData = fs.readFileSync(dbFilePath)
  db = JSON.parse(dbData)
} else {
  fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2))
}

function saveDb () {
  fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2))
}

function generateRandomText (length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

const prefixes = ['Tech', 'Digital', 'Cyber', 'Cloud', 'Data', 'Web', 'Mobile', 'Virtual', 'AI', 'IoT', 'Block', 'Crypto', 'Nano', 'Bio']
const suffixes = ['Hub', 'Labs', 'Solutions', 'Systems', 'Technologies', 'Net', 'Stack', 'Ware', 'Logic', 'Forge', 'Matic', 'Scope', 'Plex', 'Byte']
const generateRandomTechName = () => `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`

async function createFile () {
  const fileName = `${generateRandomTechName()}.txt`
  const filePath = path.join(dataDir, fileName)
  const randomText = generateRandomText(100)

  fs.writeFileSync(filePath, randomText)

  const fileContents = fs.readFileSync(filePath)
  const checksum = crypto.createHash('sha512').update(fileContents).digest('hex')

  const volumeData = {
    name: fileName,
    ip: '127.0.0.1',
    owner: '0x0123456789abcdef0123456789abcdef01234567',
    checksum
  }

  const response = await api.post('/create', volumeData)
  const { receipt: { fileId } } = response.data

  if (response.ok) {
    db[fileId] = {
      id: fileId,
      name: fileName,
      filePath,
      checksum
    }
    saveDb()
    console.log('File created and volume registered:', db[fileId])
  } else {
    console.error('Failed to create volume:', response.problem)
  }
}

// Edit the file by adding random text to increase its size
async function editFile (fileId) {
  const fileData = db[fileId]
  if (!fileData) {
    console.error('File not found in the database')
    return
  }

  const additionalText = generateRandomText(100)
  fs.appendFileSync(fileData.filePath, additionalText)

  const fileContents = fs.readFileSync(fileData.filePath)
  const newChecksum = crypto.createHash('sha512').update(fileContents).digest('hex')

  const updateData = {
    name: fileData.name,
    ip: '127.0.0.1',
    newChecksum
  }

  const response = await api.patch(`/update/${fileId}`, updateData)

  if (response.ok) {
    fileData.checksum = newChecksum
    saveDb()
    console.log('File updated and volume registered:', fileData)
  } else {
    console.error('Failed to update volume:', response.problem)
  }
}

async function listVolumes (fileId) {
  const response = await api.get('/list')

  if (response.ok) {
    console.log('Volumes:', response.data)
  } else {
    console.error('Failed to get volumes list:', response.problem)
  }
}

async function getFileHistory (fileId) {
  const response = await api.get(`/history/${fileId}`)

  if (response.ok) {
    console.log('File history:', response.data)
  } else {
    console.error('Failed to get file history:', response.problem)
  }
}

async function runCLI () {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Choose an action',
      choices: [
        'Create and track new file',
        'Update existing file',
        'List all files to the latest version',
        'Get specific file history',
        'Exit'
      ]
    }
  ])

  switch (action) {
    case 'Create and track new file':
      await createFile()
      break
    case 'Update existing file': {
      const { fileIdToEdit } = await inquirer.prompt([
        {
          type: 'input',
          name: 'fileIdToEdit',
          message: 'Enter the fileId to edit:'
        }
      ])
      await editFile(fileIdToEdit)
      break
    }
    case 'List all files to the latest version': {
      await listVolumes()
      break
    }
    case 'Get specific file history': {
      const { fileIdToGetHistory } = await inquirer.prompt([
        {
          type: 'input',
          name: 'fileIdToGetHistory',
          message: 'Enter the fileId to get history:'
        }
      ])
      await getFileHistory(fileIdToGetHistory)
      break
    }
    case 'Exit':
      console.log('Goodbye!')
      break
    default:
      console.log('Invalid action. Exiting.')
  }
}

runCLI()
