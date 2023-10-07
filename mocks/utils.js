const fs = require("fs")
const path = require("path")

const isE2E = process.env.RUNNING_E2E === "true"

async function updateFixture(updates) {
  const mswDataPath = path.join(__dirname, `./msw.local.json`)
  let mswData = {}
  try {
    const contents = await fs.promises.readFile(mswDataPath)
    mswData = JSON.parse(contents.toString())
  } catch (error) {
    console.error(`Error reading and parsing the msw fixture. Clearing it.`, error.stack ?? error)
  }
  await fs.promises.writeFile(mswDataPath, JSON.stringify({ ...mswData, ...updates }, null, 2))
}

module.exports = { isE2E, updateFixture }
