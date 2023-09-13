import 'dotenv/config'

import { getAllAvailableOverseerrRequests } from './lib/apis/overseerr.js'
import cleanMovies from './lib/movies/index.js'
import cleanTV from './lib/tv/index.js'

async function run() {
  const overseerrRequests = await getAllAvailableOverseerrRequests()
  const overseerrMovieRequests = overseerrRequests.filter(r => r.type === 'movie')

  await cleanMovies(overseerrMovieRequests)
  // await cleanTV()
}

run()
