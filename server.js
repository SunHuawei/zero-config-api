const jsonServer = require('json-server')
const fetch = require('node-fetch')
const server = jsonServer.create()
const middleware = jsonServer.defaults()

server.use(middleware)

const options = {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "en-US,en;q=0.9,zh;q=0.8,zh-CN;q=0.7",
    "cache-control": "max-age=0",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  },
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors"
}

const installed = {}

server.use(function (req, res, next) {
  const path = req.originalUrl.split('/')

  if (path.length <= 2) {
    res.redirect('https://app.example.io')
    return
  }

  const target = `/${path[1]}/${path[2]}`
  if (installed[target] === true) {
    next()
    return
  } else if (installed[target]) {
    res.status(500).jsonp(installed[target])
    return
  }

  // https://ghproxy.com/
  // https://hub.fastgit.org/
  // https://7ed.net/gra/
  // https://raw.sevencdn.com/...
  const targetUrl = `https://raw.sevencdn.com/${path[1]}/${path[2]}/master/db.json`
  console.log('targetUrl: ', targetUrl)
  fetch(targetUrl, options)
    .then(r => r.text())
    .then(c => {
      console.log('targetUrl loaded: ', targetUrl, c, c.length)
      let json = JSON.parse(c)
      const router = jsonServer.router(json)
      server.use(target + '/api', router)
      console.log('router set for ', targetUrl)

      installed[target] = true

      next()
    })
    .catch(e => {
      console.error(e)
      res.status(500).jsonp({
        e,
        message: e.toString()
      })
      installed[target] = e
      next()
    })
})

const port = parseInt(process.env.PORT, 10) || 3000
server.listen(port, () => {
  console.log('JSON Server is running')
})

module.exports = server