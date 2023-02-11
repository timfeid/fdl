import 'reflect-metadata'
import dotenv from 'dotenv'
import { PrismaClient } from '@fdl/data'
import { Container } from 'typedi'
import Parser from 'rss-parser'
import { RssService } from './modules/rss/rss.service'

dotenv.config()

Container.set(PrismaClient, new PrismaClient())
Container.set(Parser, new Parser())

async function run() {
  // console.log(await Container.get(PrismaClient).downloadable.findMany())

  // await Container.get(RssService).read('https://hdencode.org/tag/movies/feed/')
  await Container.get(RssService).read('https://hdencode.org/tag/tv-shows/feed/')
}

run()
