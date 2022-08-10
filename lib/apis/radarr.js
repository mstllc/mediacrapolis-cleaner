async function radarrFetch(path, method = 'GET', query = {}) {
  const urlSearchParams = new URLSearchParams({ ...query, apikey: process.env.RADARR_API_KEY })
  
  const response = await fetch(`${process.env.RADARR_BASE_URL}${path}?${urlSearchParams}`, {
    method
  })

  if (method !== 'DELETE') {
    const data = await response.json()

    return data
  }
}

// Get movie details for a movie by TMDB ID.
export function getRadarrMovie(tmdbId) {
  return radarrFetch(`/api/v3/movie`, 'GET', { tmdbId })
}

// Get history for a movie by id.
export function getRadarrMovieHistory(movieId) {
  return radarrFetch(`/api/v3/history/movie`, 'GET', { movieId })
}

// Delete the movie from Radarr and also the file(s)
// that were downloaded.
export function deleteRadarrMovie(movieId) {
  return radarrFetch(`/api/v3/movie/${movieId}`, 'DELETE', {
    deleteFiles: true,
    addImportExclusion: false
  })
}

export default radarrFetch
