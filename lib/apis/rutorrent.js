import xmlrpc from 'xmlrpc'

const client = xmlrpc.createSecureClient({
  host: process.env.RUTORRENT_HOST,
  port: 443,
  path: '/xmlrpc',
  basic_auth: {
    user: process.env.RUTORRENT_USERNAME,
    pass: process.env.RUTORRENT_PASSWORD
  }
})

// Delete a torrent by it's hash and also it's downloaded data.
// (Not sure what `d.set_custom5` is for, but it's in the example I followed)
export function deleteRUTorrent(hash) {
  return new Promise((resolve, reject) => {
    client.methodCall('system.multicall', [[
      { methodName: 'd.set_custom5', params: [hash, '1'] },
      { methodName: 'd.delete_tied', params: [hash] },
      { methodName: 'd.erase', params: [hash] }
    ]], (error, value) => {
      if (error) {
        return reject(error)
      }

      return resolve(value)
    })
  })
}

export default client
