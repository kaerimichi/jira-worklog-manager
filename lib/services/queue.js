const q = require('queue')()

module.exports = class QueueService {
  constructor () {
    this.q = q
    this.results = {
      responses: [],
      errors: []
    }
  }

  registerResponse (response) {
    this.results.responses.push(response)
    return this
  }

  registerError (error) {
    this.results.errors.push(error)
    return this
  }

  addJob (...job) {
    this.q.push(...job)
    return this
  }

  process () {
    return new Promise((resolve, reject) => {
      try {
        this.q.start(resolve)
      } catch (e) {
        reject(e)
      }
    })
  }

  getResults () {
    return this.results
  }
}
