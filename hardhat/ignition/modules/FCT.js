const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')

module.exports = buildModule('FCTModule', (m) => {
  const fct = m.contract('FCT', ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'])
  return { fct }
})
