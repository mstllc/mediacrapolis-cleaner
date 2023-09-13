export async function slackFetch(body = {}) {
  if (!process.env.SLACK_WEBHOOK_URL) return {}

  const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (
    response.headers.has('content-type') &&
    response.headers.get('content-type').includes('application/json')
  ) {
    return await response.json()
  }

  return response.body || {}
}

export function postMovieDeletedMessage(movie, request) {
  return slackFetch({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${movie.title} (${new Date(movie.releaseDate).getFullYear()})* has been automatically deleted. You can request it again if you didn't have a chance to check it out.`
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Request Again',
            emoji: true
          },
          url: `http://soyuz.whatbox.ca:28648/movie/${movie.id}`,
        }
      }
    ]
  })
}

export function postTVDeletedMessage(show, season, request) {
  return slackFetch({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${show.name} - Season ${season.seasonNumber}* has been automatically deleted. You can request it again if you didn't have a chance to check it out.`
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Request Again',
            emoji: true
          },
          url: `http://soyuz.whatbox.ca:28648/tv/${show.id}`,
        }
      }
    ]
  })
}
