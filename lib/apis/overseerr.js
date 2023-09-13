export async function overseerrFetch(path, method = 'GET', body = {}) {
  const response = await fetch(`${process.env.OVERSEERR_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.OVERSEERR_API_KEY
    },
    ...(method === 'POST' ? { body: JSON.stringify(body) } : {})
  })

  if (response.headers.has('content-type') && response.headers.get('content-type').includes('application/json')) {
    return await response.json()
  }

  return response.body || {}
}

// Get all available requests in order of when they were marked as available.
export async function getAllAvailableOverseerrRequests() {
  let pages = 1
  let pagesFetched = 0
  let pageSize = 100
  let requests = []
  while (pagesFetched < pages) {
    const { pageInfo, results } = await overseerrFetch(`/api/v1/request?filter=available&sort=modified&take=${pageSize}&skip=${pagesFetched * pageSize}`)
    pages = pageInfo.pages
    pageSize = pageInfo.pageSize
    requests = requests.concat(results)
    pagesFetched++
  }

  requests.sort((a, b) => {
    return new Date(a.media.mediaAddedAt) - new Date(b.media.mediaAddedAt)
  })
  
  return requests
}

// Get the oldest available movie requests in order of when they
// were marked as available.
export function getOldestAvailableOverseerrMovieRequests() {
  return overseerrFetch(`/api/v1/request`)
}

// Delete a request.
export function deleteOverseerrRequest(requestId) {
  return overseerrFetch(`/api/v1/request/${requestId}`, 'DELETE')
}

// Delete a  media item.
export function deleteOveseerrMedia(mediaId) {
  return overseerrFetch(`/api/v1/media/${mediaId}`, 'DELETE')
}

// Get a movie details
export function getOverseerrMovieDetails(movieId) {
  return overseerrFetch(`/api/v1/movie/${movieId}`)
}


export default overseerrFetch