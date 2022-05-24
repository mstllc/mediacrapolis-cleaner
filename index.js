import 'dotenv/config'

import cleanMovies from './lib/movies/index.js'
import cleanTV from './lib/tv/index.js'
import { resyncOmbiMedia } from './lib/apis/ombi.js'

async function run() {
 await cleanMovies()
 await cleanTV()

 // Media resync applies to both movies and TV.
 await resyncOmbiMedia()
}

run()
