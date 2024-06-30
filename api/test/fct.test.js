const { create } = require('apisauce')
const crypto = require('crypto')

const prefixes = ['Tech', 'Digital', 'Cyber', 'Cloud', 'Data', 'Web', 'Mobile', 'Virtual', 'AI', 'IoT', 'Block', 'Crypto', 'Nano', 'Bio']
const suffixes = ['Hub', 'Labs', 'Solutions', 'Systems', 'Technologies', 'Net', 'Stack', 'Ware', 'Logic', 'Forge', 'Matic', 'Scope', 'Plex', 'Byte']
const generateRandomTechName = () => `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`

const api = create({
  baseURL: 'http://localhost:3030'
})

describe('Volume API Tests', () => {
  let createdVolumeId
  const name = generateRandomTechName()
  const checksum = crypto.createHash('sha512').update('checksum').digest('hex')
  const updatedChecksum = crypto.createHash('sha512').update('newChecksum').digest('hex')

  it('should create a volume', async () => {
    const volumeData = {
      name,
      ip: '127.0.0.1',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      checksum
    }

    const response = await api.post('/create', volumeData)
    expect(response.ok).toBe(true)
    expect(response.data.success).toBe(true)
    expect(response.data.receipt).toHaveProperty('transactionHash')
    expect(response.data.receipt).toHaveProperty('blockNumber')

    createdVolumeId = response.data.receipt.volumeId
  })

  it('should list all volumes and find the created volume', async () => {
    const response = await api.get('/list')
    expect(response.ok).toBe(true)
    const volumes = response.data
    expect(Array.isArray(volumes)).toBe(true)

    // Find the created volume in the list
    const createdVolume = volumes.find(volume => volume.id === createdVolumeId)
    expect(createdVolume).toBeDefined()
    expect(createdVolume.name).toBe(name)
  })

  it('should update the volume with an updated checksum', async () => {
    const updateData = {
      name,
      ip: '127.0.0.1',
      newChecksum: updatedChecksum
    }

    const response = await api.patch(`/update/${createdVolumeId}`, updateData)
    expect(response.ok).toBe(true)
    expect(response.data.success).toBe(true)
    expect(response.data.receipt).toHaveProperty('transactionHash')
    expect(response.data.receipt).toHaveProperty('blockNumber')
  })

  it('should check the updated checksum', async () => {
    const response = await api.get(`/history/${createdVolumeId}`)
    expect(response.ok).toBe(true)
    const history = response.data
    expect(Array.isArray(history)).toBe(true)
    expect(history.length).toBeGreaterThanOrEqual(1) // Ensure at least one entry in history

    // Check the latest entry for the updated checksum
    const latestVolume = history[history.length - 1]
    expect(latestVolume.checksum).toBe(updatedChecksum)
  })
})
