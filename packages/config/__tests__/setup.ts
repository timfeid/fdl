import { createConnection } from '@fdl/data'

before((done) => {
  createConnection().then(() => {
    done()
  })
})
