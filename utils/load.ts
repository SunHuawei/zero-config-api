import http from 'http'
import https from 'https'
import low from 'lowdb'
import Memory from 'lowdb/adapters/Memory'

function isURL(s) {
  return /^(http|https):/.test(s)
}

export default function (source): Promise<low.LowdbSync<any>> {
  return new Promise((resolve, reject) => {
    if (isURL(source)) {
      // Normalize the source into a URL object.
      const sourceUrl = new URL(source)
      // Pick the client based on the protocol scheme
      const client = sourceUrl.protocol === 'https:' ? https : http

      client
        .get(sourceUrl, (res) => {
          let dbData = ''
          res.on('data', (data) => {
            dbData += data
          })

          res.on('end', () => {
            resolve(low(new Memory(undefined)).setState(JSON.parse(dbData)))
          })
        })
        .on('error', (error) => {
          return reject(error)
        })
    } else {
      throw new Error(`Unsupported source ${source}`)
    }
  })
}
