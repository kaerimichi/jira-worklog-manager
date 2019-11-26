#!/usr/bin/env node

const moment = require('moment')
const Table = require('cli-table')

module.exports = async (options, { jira }) => {
  try {
    const issueId = options.issue
    const { data } = await jira.retrieveWorklogsFromIssue(issueId)
    let worklogs = data.fields.worklog.worklogs || []
    const table = new Table({
      head: ['Created by', 'Updated by', 'Registered at', 'Work log'],
      colWidths: [24, 24, 32, 12]
    })
    let worklogTimeSum = 0

    worklogs = worklogs.map(entry => {
      worklogTimeSum += entry.timeSpentSeconds
      return [
        entry.author.displayName,
        entry.updateAuthor.displayName,
        moment(entry.started).format('DD/MM/YYYY [@] HH:mm:ss'),
        entry.timeSpent
      ]
    })

    worklogTimeSum = moment.duration(worklogTimeSum, 'seconds')
    table.push(...worklogs, [], ['', '', '', worklogTimeSum.format('h[h] m[m]')])
    process.stdout.write(`${table.toString()}\n`)
  } catch (e) {
    throw e
  }
}
