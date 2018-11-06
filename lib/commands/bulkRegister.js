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
        const startTime = worklog.start ? worklog.start.replace('h', ':') : null
        const endTime = worklog.end ? worklog.end.replace('h', ':') : null
        const issue = applyIssueAlias(worklog.issueId, tasks)
        const jobObject = {
          message: worklog.duration
            ? `${date}: ${worklog.duration} minutes on issue ${issue}`
            : `${date}: from ${startTime} to ${endTime} on issue ${issue}`,
          date,
          issue,
          duration: worklog.duration || null,
          start: startTime,
          end: endTime,
          comment: worklog.comment
        }

        registrations.push(jobObject)

        jobs.push(() => {
          return jira.registerWorklog(jobObject)
            .then(response => queue.registerResponse(response))
            .catch(error => queue.registerError({ jobObject, error }))
        })
      })
    })

    if (!options.dryRun) {
      queue.addJob(...jobs)
      await queue.process()

      const { responses, errors } = queue.getResults()
      process.stdout.write(`Operation completed: ${responses.length} registered / ${errors.length} failed.\n`)

      if (errors.length) {
        const messages = errors.map(({ jobObject, error }) => `- ${jobObject.message} (${error.response.status})`)

        process.stdout.write(`\n> Failed work logs:\n\n`)
        process.stdout.write(`${messages.join('\n')}\n`)
      }
    } else {
      process.stdout.write(`\nWork logs to be registered:\n\n`)
      registrations.forEach(({ message }) => process.stdout.write(`  ${message}\n`))
      process.stdout.write('\n')
    }
  } catch (e) {
    throw e
  }
}
