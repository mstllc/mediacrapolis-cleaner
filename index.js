import 'dotenv/config'

import { getAllOverseerrRequests } from './lib/apis/overseerr.js'
import cleanMovies from './lib/movies/index.js'
import cleanTV from './lib/tv/index.js'

async function run() {
  const overseerrRequests = await getAllOverseerrRequests()
  
  await cleanMovies(overseerrRequests)
  await cleanTV(overseerrRequests)
}

run()
