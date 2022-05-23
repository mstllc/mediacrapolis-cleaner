import 'dotenv/config'

import cleanMovies from './lib/movies/index.js'
import cleanTV from './lib/tv/index.js'

async function run() {
 await cleanMovies()
 await cleanTV()   
}

run()
