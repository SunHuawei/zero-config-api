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
            try {
              const json = JSON.parse(dbData)
              resolve(low(new Memory(undefined)).setState(json))
            } catch(e) {
              return reject(e)
            }
          })
        })
        .on('error', (error) => {
          return reject(error)
        })
    } else {
      return reject(`Unsupported source ${source}`)
    }
  })
}
