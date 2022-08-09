import { getOldestAvailableOmbiMovieRequests, deleteOmbiMovieRequest, markOmbiMovieUnavailable } from '../apis/ombi.js'
import { getRadarrMovie, getRadarrMovieHistory, deleteRadarrMovie } from '../apis/radarr.js'
import { deleteRUTorrent } from '../apis/rutorrent.js'

async function cleanMovies() {
  // Get the oldest available request from Ombi, which should
  // give the movie that's been around the longest.
  const ombiMovieRequests = await getOldestAvailableOmbiMovieRequests()
  const ombiRequest = ombiMovieRequests.collection[0]

  // Get the corresponding movie from Radarr (using The Movie DB ID
  // because `id` doesn't always match between Ombi/Radarr).
  const radarrMovie = await getRadarrMovie(ombiRequest.theMovieDbId)
  const radarrId = radarrMovie[0].id

  // Get a unique list of ruTorrent hashes from the Radarr movie history.
  // This history includes an ruTorrent hash for each torrent file that was
  // downloaded to satisfy the media (For movies, should just be one torrent).
  const radarrMovieHistory = await getRadarrMovieHistory(radarrId)
  const ruTorrentHashes = radarrMovieHistory.reduce((hashes, { downloadId }) => {
    if (downloadId && !hashes.includes(downloadId)) {
      hashes.push(downloadId)
    }

    return hashes
  }, [])

  // 1. Delete the ruTorrent torrents.
  // This also deletes the downloaded file(s) from the filesystem.
  if (ruTorrentHashes.length) {
    for (let ruTorrentHash of ruTorrentHashes) {
      await deleteRUTorrent(ruTorrentHash)
    }
  }
  
  // 2. Delete the  movie from Radarr
  // This also deletes the file(s) from the Plex library on the filesystem.
  await deleteRadarrMovie(radarrId)

  // 3. Mark the movie as unavailable in Ombi (does this help?)
  // Not sure if this does anything, but whatever.
  await markOmbiMovieUnavailable(ombiRequest.id)
  
  // 4. Delete the movie request from Ombi
  // Removes the request data from Ombi so it can be requested again.
  await deleteOmbiMovieRequest(ombiRequest.id)

  // 5. Post to Slack about this movie being deleted
  // TODO: connect this to Slack somehow?
  console.log(`Deleted Movie: ${ombiRequest.title}`)
}

export default cleanMovies
