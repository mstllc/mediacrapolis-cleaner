import { getOldestAvailableOmbiMovieRequests, deleteOmbiMovieRequest, markOmbiMovieUnavailable } from '../apis/ombi.js'
import { getRadarrMovieHistory, deleteRadarrMovie } from '../apis/radarr.js'
import { deleteRUTorrent } from '../apis/rutorrent.js'

async function cleanMovies() {
  // This currently just picks the oldest available movie request and cleans it.
  // Determine how to decide which ones should go (Based on date?  Available disk space?)

  const ombiMovieRequests = await getOldestAvailableOmbiMovieRequests()
  const ombiRequest = ombiMovieRequests.collection[0]
  const radarrMovieHistory = await getRadarrMovieHistory(ombiRequest.id)

  // Get a unique list of ruTorrent hashes from the movie history.
  const ruTorrentHashes = radarrMovieHistory.reduce((hashes, { downloadId }) => {
    if (downloadId && !hashes.includes(downloadId)) {
      hashes.push(downloadId)
    }

    return hashes
  }, [])

  // 1. Delete the ruTorrent torrents.
  if (ruTorrentHashes.length) {
    for (let ruTorrentHash of ruTorrentHashes) {
      await deleteRUTorrent(ruTorrentHash)
    }
  }
  
  // 2. Delete the  movie from Radarr
  await deleteRadarrMovie(ombiRequest.id)

  // 3. Mark the movie as unavailable in Ombi (does this help?)
  await markOmbiMovieUnavailable(ombiRequest.id)
  
  // 4. Delete the movie request from Ombi
  await deleteOmbiMovieRequest(ombiRequest.id)

  // 5. Post to Slack about this movie being deleted?
  console.log(`Deleted Movie: ${ombiRequest.title}`)
}

export default cleanMovies
