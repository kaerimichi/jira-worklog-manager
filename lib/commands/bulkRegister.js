#!/usr/bin/env node

const fs = require('fs')
const yaml = require('js-yaml')
const uuid = require('uuid/v4')
const { flatten } = require('lodash')
const { getIntervalAsSeconds } = require('../helpers/timeCalc')

function applyIssueAlias (alias, commonTasks) {
  if (!commonTasks) return alias
  for (let task of commonTasks) {
    if (task.alias === alias) {
      return task.issueId
    }
  }

  return alias
}

function wipeYamlContent (content, errors) {
  const failedWorklogsUuids = errors.map(e => e.entryUuid)

  content.summary.forEach((dateEntry, dateEntryIndex, summaryArray) => {
    dateEntry.worklogs.forEach((worklog, worklogIndex, worklogsArray) => {
      if (failedWorklogsUuids.indexOf(worklog.uuid) < 0) {
        delete worklogsArray[worklogIndex]
      }

      delete worklogsArray[worklogIndex].uuid
    })
    dateEntry.worklogs = dateEntry.worklogs.filter(e => e)

    if (!dateEntry.worklogs.length) {
      delete summaryArray[dateEntryIndex]
    }
  })

  content.summary = content.summary.filter(e => e)

  return content
}

function applyUuids (rawContent) {
  rawContent.summary.forEach(dateEntry => {
    dateEntry.worklogs.forEach(worklog => {
      worklog.uuid = uuid()
    })
  })

  return rawContent
}

function getWorklogsToRegister (issue, date, worklogEntry, startTime, endTime, commonTasks) {
  const issueTotal = issue.split(',').length
  const multipleIssues = issueTotal > 1
  const rawIssues = multipleIssues ? issue.split(',').map(e => e.replace(' ', '')) : [issue]
  const issuesToRegister = rawIssues.map(e => applyIssueAlias(e, commonTasks))
  const totalOfPeriod = worklogEntry.duration || getIntervalAsSeconds(startTime, endTime) / 60
  
  return issuesToRegister.map((issue, index) => {
    let duration = Math.floor(totalOfPeriod / issueTotal)

    if (index === 0) duration += (totalOfPeriod % issueTotal)

    return {
      message: duration
        ? `${date}: ${duration} minutes on issue ${issue}`
        : `${date}: from ${startTime} to ${endTime} on issue ${issue}`,
      date,
      issue,
      duration: duration || null,
      start: startTime,
      end: endTime,
      comment: !multipleIssues ? worklogEntry.comment : null
    }
  })
}

module.exports = async (options, { jira, queue }) => {
  try {
    const yamlContent = yaml.safeLoad(fs.readFileSync(options.filename, 'utf8'))
    const indexedContent = applyUuids(yamlContent)
    const { summary, tasks } = indexedContent
    const registrations = []
    const jobs = []

    summary.forEach(({ date, worklogs }) => {
      worklogs.forEach((worklog, index, arr) => {
        const previousElement = arr[index - 1]
        const startTime = worklog.start
          ? worklog.start.replace('h', ':')
          : previousElement && previousElement.end
            ? previousElement.end.replace('h', ':')
            : null
        const endTime = worklog.end ? worklog.end.replace('h', ':') : null
        const entryUuid = worklog.uuid
        const jobObjects = flatten(
          getWorklogsToRegister(
            worklog.issueId,
            date,
            worklog,
            startTime,
            endTime,
            tasks
          )
        )

        jobObjects.forEach(jobObject => {
          registrations.push(jobObject)
          jobs.push(() => {
            return jira.registerWorklog(jobObject)
              .then(response => queue.registerResponse(response))
              .catch(error => queue.registerError({ entryUuid, jobObject, error }))
          })
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

        if (options.removeRegisteredWorklogs) {
          fs.writeFileSync(options.filename, yaml.safeDump(wipeYamlContent(yamlContent, errors)))
        }

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
