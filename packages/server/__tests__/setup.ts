import { app } from "../src/app"

before((done) => {
  app.on('ready', done)
})
