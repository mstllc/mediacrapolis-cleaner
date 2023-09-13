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
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '*Movie Has Been Deleted*'
          }
        ]
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${movie.title} (${new Date(movie.releaseDate).getFullYear()})`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: movie.overview
        },
        accessory: {
          type: 'image',
          image_url: `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${movie.posterPath}`,
          alt_text: 'movie poster'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Requested By*\n${request.requestedBy.displayName || request.requestedBy.username}`
          },
          {
            type: 'mrkdwn',
            text: '*Request Status*\nDeleted'
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: "This movie has been deleted. It can be requested again if you haven't checked it out yet."
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Request Again',
            emoji: true
          },
          value: `request_again_${movie.id}`,
          url: `http://soyuz.whatbox.ca:28648/movie/${movie.id}`,
          action_id: 'request-again-button'
        }
      }
    ]
  })
}

export function postTVDeletedMessage(show, season, request) {
  return slackFetch({
    blocks: [
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '*Series Has Been Deleted*'
          }
        ]
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${show.name} - Season ${season.seasonNumber}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: show.overview
        },
        accessory: {
          type: 'image',
          image_url: `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${show.posterPath}`,
          alt_text: 'movie poster'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Requested By*\n${request.requestedBy.displayName || request.requestedBy.username}`
          },
          {
            type: 'mrkdwn',
            text: '*Request Status*\nDeleted'
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: "This show has been deleted. It can be requested again if you haven't checked it out yet."
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Request Again',
            emoji: true
          },
          value: `request_again_${show.id}`,
          url: `http://soyuz.whatbox.ca:28648/tv/${show.id}`,
          action_id: 'request-again-button'
        }
      }
    ]
  })
}
