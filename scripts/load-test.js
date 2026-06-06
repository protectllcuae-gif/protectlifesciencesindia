const autocannon = require('autocannon')

const target = process.env.TARGET || 'http://localhost:3000'
const connections = Number(process.env.CONNECTIONS || 20)
const duration = Number(process.env.DURATION || 10)

console.log(`Running load test against ${target} with ${connections} connections for ${duration}s`)

const instance = autocannon(
  {
    url: target,
    connections,
    duration,
    method: 'GET',
    headers: {
      'user-agent': 'ProtectLifeSciencesLoadTest/1.0',
    },
  },
  (err, results) => {
    if (err) {
      console.error('Load test failed', err)
      process.exit(1)
    }
    console.log(autocannon.printResult(results))
  }
)

process.once('SIGINT', () => {
  instance.stop()
})
