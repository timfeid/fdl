import 'reflect-metadata'
import dotenv from 'dotenv'
import Container from 'typedi'
import { prisma, PrismaClient } from '@prisma/client'
import { clientDetails, defaultContextGrabber, getTestClient } from './test-client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { join } from 'path'
import { S3Client } from '@aws-sdk/client-s3'
import { createAxiosMock } from './mock'
import redis from 'redis-mock'

dotenv.config({ path: join(__dirname, '../.env.test'), override: true })

createAxiosMock()

getTestClient()
if (process.env.TEST_TYPE === 'unit') {
  Container.set(PrismaClient, mockDeep<PrismaClient>())
} else {
  Container.set(PrismaClient, new PrismaClient())
}

Container.set(S3Client, new S3Client({ region: 'eu-west-1' }))
Container.set('redis', redis.createClient())

// beforeAll(() => {
//   init()
// })

// beforeEach(() => {
//   clientDetails.context = defaultContextGrabber
// })
