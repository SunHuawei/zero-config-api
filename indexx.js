const fetch = require('node-fetch')

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
  "mode": "cors",
}

function doFetch () {
  const targetUrl = 'https://raw.sevencdn.com/typicode/demo/master/db.json'
  console.log('targetUrl: ', targetUrl)
  fetch(targetUrl, options)
    .then(r => r.text())
    .then(c => {
      console.log('targetUrl loaded: ', targetUrl, c)
    })
}

doFetch()