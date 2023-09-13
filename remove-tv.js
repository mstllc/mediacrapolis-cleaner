import 'dotenv/config'

import { getAllOverseerrRequests } from './lib/apis/overseerr.js'
import cleanTV from './lib/tv/index.js'

async function run() {
  const overseerrRequests = await getAllOverseerrRequests()
  
  await cleanTV(overseerrRequests)
}

run()
