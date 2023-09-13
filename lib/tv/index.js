import { deleteOveseerrMedia, getOverseerrTVDetails } from '../apis/overseerr.js'
import { getSonarrTVHistory, deleteSonarrSeriesSeason } from '../apis/sonarr.js'
import { deleteRUTorrent } from '../apis/rutorrent.js'
import { postTVDeletedMessage } from '../apis/slack.js'
import { deleteFileAndParentDirs } from '../utils/index.js'

async function cleanTV(requests) {
  // Get the oldest available request from Overseerr, which should
  // give the series that's been around the longest.
  const overseerrTVRequests = requests.filter(r => r.type === 'tv' && [4, 5].includes(r.media.status)).sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt)
  })

  const overseerrRequest = overseerrTVRequests[0]
  const overseerrTVShow = await getOverseerrTVDetails(overseerrRequest.media.tmdbId)

  // Get the Radarr Id from the Overseerr request
  const sonarrId = overseerrRequest.media.externalServiceId

  // Do this in a loop for each season in the request
  for (const season of overseerrRequest.seasons) {
    // Get a unique list of ruTorrent hashes from the Radarr series history.
    // This history includes an ruTorrent hash for each torrent file that was
    // downloaded to satisfy the media.
    const sonarrTVHistory = await getSonarrTVHistory(sonarrId, season.seasonNumber)
    
    const [ruTorrentHashes, files] = sonarrTVHistory.reduce((acc, { downloadId, data }) => {
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

    // 2. Delete the series season from Sonarr
    // This also deletes the file(s) from the Plex library on the filesystem.
    await deleteSonarrSeriesSeason(sonarrId, season.seasonNumber)

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
    await postTVDeletedMessage(overseerrTVShow, season, overseerrRequest)
    console.log(`Deleted TV Season ${season.seasonNumber}: ${overseerrTVShow.name}`)
  } 
}

export default cleanTV
