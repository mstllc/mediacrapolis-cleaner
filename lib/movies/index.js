import { deleteOveseerrMedia, getOverseerrMovieDetails } from '../apis/overseerr.js'
import { getRadarrMovieHistory, deleteRadarrMovie } from '../apis/radarr.js'
import { deleteRUTorrent } from '../apis/rutorrent.js'
import { postMovieDeletedMessage } from '../apis/slack.js'
import { deleteFileAndParentDirs } from '../utils/index.js'

async function cleanMovies(requests) {
  // Get the oldest available request from Overseerr, which should
  // give the movie that's been around the longest.
  const overseerrRequest = requests[0]
  const overseerrMovie = await getOverseerrMovieDetails(overseerrRequest.media.externalServiceSlug)

  // Get the Radarr Id from the Overseerr request
  const radarrId = overseerrRequest.media.externalServiceId

  // Get a unique list of ruTorrent hashes from the Radarr movie history.
  // This history includes an ruTorrent hash for each torrent file that was
  // downloaded to satisfy the media (For movies, should just be one torrent).
  const radarrMovieHistory = await getRadarrMovieHistory(radarrId)
  const [ruTorrentHashes, files] = radarrMovieHistory.reduce((acc, { downloadId, data }) => {
    if (downloadId && !acc[0].includes(downloadId)) {
      acc[0].push(downloadId)
    }
    if (data && data.droppedPath && !acc[1].includes(data.droppedPath)) {
      acc[1].push(data.droppedPath)
    }
    if (data && data.importedPath && !acc[1].includes(data.importedPath)) {
      acc[1].push(data.importedPath)
    }

    return acc
  }, [[], []])
  
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

  // 3. Delete the media from Overseerr
  // Resets the movies availability status in Overseerr.
  // Removes the request data from Overseerr so it can be requested again.
  await deleteOveseerrMedia(overseerrRequest.media.id)

  // 4. Just make sure the files are actually deleted...
  if (files.length) {
    for (const file of files) {
      await deleteFileAndParentDirs(file)
    }
  }

  // 5. Post to Slack about this movie being deleted
  await postMovieDeletedMessage(overseerrMovie, overseerrRequest)
  console.log(`Deleted Movie: ${overseerrMovie.title}`)
}

export default cleanMovies
