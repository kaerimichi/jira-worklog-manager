#!/usr/bin/env node

const fs = require('fs')
const yaml = require('js-yaml')

function applyIssueAlias (alias, commonTasks) {
  if (!commonTasks) return alias
  for (let task of commonTasks) {
    if (task.alias === alias) {
      return task.issueId
    }
  }

  return alias
}

module.exports = async (options, { jira, queue }) => {
  try {
    const { summary, tasks } = yaml.safeLoad(fs.readFileSync(options.filename, 'utf8'))
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
          issue: applyIssueAlias(worklog.issueId, tasks),
          comment: worklog.comment
        }

        registrations.push(jobObject)

        jobs.push(() => {
          return jira.registerWorklog(jobObject)
            .then(response => queue.registerResponse(response))
            .catch(error => queue.registerError(error))
        })
      })
    })

    if (!options.dryRun) {
      queue.addJob(...jobs)
      await queue.process()

      const { responses, errors } = queue.getResults()
      process.stdout.write(`Operation completed: ${responses.length} registered / ${errors.length} failed.\n`)
    } else {
      process.stdout.write(`\nWork logs to be registered:\n\n`)
      registrations.forEach(({ message }) => process.stdout.write(`  ${message}\n`))
      process.stdout.write('\n')
    }
  } catch (e) {
    throw e
  }
}
