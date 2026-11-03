/**
 * Infrastructure smoke-test endpoint: proves the JSON storage utility
 * (auto-init, read, atomic write) works end-to-end. Not a product/order
 * endpoint - those are added in later roadmap phases.
 */
export default defineEventHandler(async () => {
  await readData()
  const data = await writeData((current) => current)

  return success({ status: 'ok', dataVersion: data.version })
})
