import fs from 'fs-extra'
import path from 'path'

// Delete a file and all of it's parent directories.
export async function deleteFileAndParentDirs(file) {
  if (file.startsWith(process.env.RUTORRENT_FILES_PATH)) {
    const topLevelDir = file.replace(process.env.RUTORRENT_FILES_PATH, '').split('/')[0]
    await fs.remove(path.resolve(process.env.RUTORRENT_FILES_PATH, topLevelDir))
  } else if (file.startsWith(process.env.PLEX_MOVIES_LIBRARY_PATH)) {
    const topLevelDir = file.replace(process.env.PLEX_MOVIES_LIBRARY_PATH, '').split('/')[0]
    await fs.remove(path.resolve(process.env.PLEX_MOVIES_LIBRARY_PATH, topLevelDir))
  } else if (file.startsWith(process.env.PLEX_TV_LIBRARY_PATH)) {
    const topLevelDir = file.replace(process.env.PLEX_TV_LIBRARY_PATH, '').split('/')[0]
    await fs.remove(path.resolve(process.env.PLEX_TV_LIBRARY_PATH, topLevelDir))
  }
}
