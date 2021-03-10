
import { VercelRequest, VercelResponse } from '@vercel/node'
import _ from 'lodash'
import express from 'express'
import finalHandler from 'finalhandler'
import jsonServer from 'json-server'
import load from '../utils/load'

const expressRouter = express.Router()

class Router {
  public user: string
  public repo: string
  public model: string
  public method: string

  constructor(req: VercelRequest) {
    const sourceUrl = new URL(req.url, 'http://localhost')
    const path = sourceUrl.pathname.split('/')

    this.user = path[1]
    this.repo = path[2]
    this.model = path[3]
    this.method = req.method || ''
  }

  get(route, callback) {
    if (this.method.toLowerCase() === 'get') {
      if (route === this.model) {
        callback()
      }
    }
  }
}

export default async function (req: VercelRequest, res: VercelResponse) {
  const r = new Router(req)

  if (!r.user || !r.repo) {
    res.status(404).send(`Not found /${r.user}/${r.repo}`)

    return
  }

  try {
    const db = await load(`https://raw.sevencdn.com/${r.user}/${r.repo}/main/db.json`)
    // @ts-ignore
    res.locals = res.locals || Object.create(null);
    // @ts-ignore
    res.jsonp = res.json;
    // @ts-ignore
    req.get = key => req.headers[key]
    // @ts-ignore
    res.get = res.getHeader
    // @ts-ignore
    res.set = res.setHeader
    // @ts-ignore
    res.links = express.response.links.bind(res)

    const router = jsonServer.router(db)

    // TODO, it's not work to handle root
    router.get('/', (req, res) => {
      console.log('root')
      res.jsonp(db.getState());
    });

    // final handler
    const done = finalHandler(req as any, res as any, {
      env: 'dev',
      onerror: e => {
        console.error(e)
      }
    });

    expressRouter.use(`/${r.user}/${r.repo}`, router).handle(req, res, done);
  } catch(e) {
    console.log('==================')
    console.error(e.stack)
    res.status(500).send(e.stack)
  }
}