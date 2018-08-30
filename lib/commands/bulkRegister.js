#!/usr/bin/env node

const fs = require('fs')
const yaml = require('js-yaml')
const registrationCommand = require('./register')

module.exports = options => {
  try {
    const { summary } = yaml.safeLoad(fs.readFileSync(options.filename, 'utf8'))
    const registrations = []

    summary.forEach(({ date, worklogs }) => {
      worklogs.forEach(worklog => {
        const startTime = worklog.start.replace('h', ':')
        const endTime = worklog.end.replace('h', ':')

        registrations.push({
          message: `${date}: from ${startTime} to ${endTime} on issue ${worklog.issueId}`,
          date,
          start: startTime,
          end: endTime,
          issue: worklog.issueId
        })
      })
    })

    if (!options.dryRun) {
      registrations.forEach(registration => {
        const { date, start, end, issue } = registration

        registrationCommand(registration)
        process.stdout.write(
          `Registered work log: [${date}] ${start} >>> ${end} - ${issue}\n`
        )
      })
    } else {
      process.stdout.write(`\nWork logs to be registered:\n\n`)
      registrations.forEach(({ message }) => process.stdout.write(`  ${message}\n`))
      process.stdout.write('\n')
    }
  } catch (e) {
    process.stderr.write(`${e.message}\n`)
    process.exit(1)
  }
}
