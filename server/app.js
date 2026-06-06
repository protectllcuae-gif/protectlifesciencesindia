const path = require('path')
const fs = require('fs')
const express = require('express')
const session = require('express-session')
const db = require('./db')

const app = express()
const PORT = process.env.PORT || 3000
const dbReady = db.initDatabase()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(async (req, res, next) => {
  try {
    await dbReady
    next()
  } catch (error) {
    next(error)
  }
})

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'protect-life-sciences-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
)

const clientDist = path.join(__dirname, '..', 'client', 'dist')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.use((req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.send('Client has not been built yet. Run "npm run build:client" from the repo root.')
  })
}

app.use((error, req, res, next) => {
  console.error(error)
  res.status(500).send('Internal Server Error')
})

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

module.exports = app
