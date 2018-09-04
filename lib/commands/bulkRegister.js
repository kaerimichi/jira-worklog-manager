#!/usr/bin/env node

const fs = require('fs')
const yaml = require('js-yaml')
const registrationCommand = require('./register')
const q = require('queue')()

module.exports = async options => {
  try {
    const { summary } = yaml.safeLoad(fs.readFileSync(options.filename, 'utf8'))
    const operationResults = { responses: [], errors: [] }
    const registrations = []
    const jobs = []

    summary.forEach(({ date, worklogs }) => {
      worklogs.forEach(worklog => {
        const startTime = worklog.start.replace('h', ':')
        const endTime = worklog.end.replace('h', ':')
        const jobObject = {
          message: `${date}: from ${startTime} to ${endTime} on issue ${worklog.issueId}`,
          date,
          start: startTime,
          end: endTime,
          issue: worklog.issueId
        }

        registrations.push(jobObject)

        jobs.push(() => {
          return registrationCommand(jobObject)
            .then(response => operationResults.responses.push(response))
            .catch(err => operationResults.errors.push(err.response))
        })
      })
    })

    if (!options.dryRun) {
      q.push(...jobs)
      q.start(() => {
        const { responses, errors } = operationResults
        process.stdout.write(`Operation completed: ${responses.length} registered / ${errors.length} failed.\n`)
      })
    } else {
      process.stdout.write(`\nWork logs to be registered:\n\n`)
      registrations.forEach(({ message }) => process.stdout.write(`  ${message}\n`))
      process.stdout.write('\n')
    }
  } catch (e) {
    throw e
  }
}
