async function sonarrFetch(path, method = 'GET', query = {}, body = {}) {
  const urlSearchParams = new URLSearchParams({ ...query, apikey: process.env.SONARR_API_KEY })
  
  const response = await fetch(`${process.env.SONARR_BASE_URL}${path}?${urlSearchParams}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(['POST', 'PUT', 'DELETE'].includes(method) ? { body: JSON.stringify(body) } : {})
  })

  if (response.headers.has('content-type') && response.headers.get('content-type').includes('application/json')) {
    return await response.json()
  }

  return response.body || {}
}

// Get movie details for a movie by TMDB ID.
export function getSonarrMovie(tmdbId) {
  return sonarrFetch(`/api/v3/movie`, 'GET', { tmdbId })
}

// Get history for a movie by id.
export function getSonarrTVHistory(seriesId, seasonNumber) {
  return sonarrFetch(`/api/v3/history/series`, 'GET', { seriesId, seasonNumber })
}

// Delete the series season from Sonarr and also the file(s)
// that were downloaded.
export async function deleteSonarrSeriesSeason(seriesId, seasonNumber) {
  // Get the episodes of the season
  const episodes = await sonarrFetch('/api/v3/episode', 'GET', { seriesId, seasonNumber })
  const episodeIds = episodes.map(e => e.id)
  const episodeFileIds = episodes.filter(e => e.episodeFileId > 0).map(e => e.episodeFileId)

  if (episodeFileIds.length) {
    // Delete the episode files for this season
    await sonarrFetch('/api/v3/episodefile/bulk', 'DELETE', {}, { episodeFileIds })
  }

  // Stop monitoring all the episodes of the season
  await sonarrFetch('/api/v3/episode/monitor', 'PUT', {}, { episodeIds, monitored: false })
}

export default sonarrFetch
