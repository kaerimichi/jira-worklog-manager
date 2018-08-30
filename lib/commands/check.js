#!/usr/bin/env node

require('moment-duration-format')

const moment = require('moment')
const service = require('../serviceHandler')()
const Table = require('cli-table')
let cmdResponse

async function getIssueWorklogs (issueId) {
  const { status, data } = await service.get(`issue/${issueId}`)
  let worklogs = data.fields.worklog.worklogs || []
  const table = new Table({
    head: ['Created by', 'Updated by', 'Registered at', 'Work log'],
    colWidths: [24, 24, 32, 12]
  })

  cmdResponse = status === 200
    ? { exitCode: 0, message: '' }
    : { exitCode: 127, message: 'There was an error while retrieving your worklogs.' }

  worklogs = worklogs.map(entry => {
    return [
      entry.author.displayName,
      entry.updateAuthor.displayName,
      moment(entry.started).format('DD/MM/YYYY [@] HH:mm:ss'),
      entry.timeSpent
    ]
  })

  table.push(...worklogs)
  process.stdout.write(`${table.toString()}\n`)
}

async function getDaySummary (date, author) {
  const table = new Table({
    head: ['Issue ID', 'Work log'],
    colWidths: [24, 24]
  })
  const { status, data } = await service.get(
    `search?startIndex=0&jql=worklogAuthor=${author}+and+worklogDate=${moment(date, 'DD/MM').format('YYYY-MM-DD')}&fields=timespent`
  )
  let issues = data.issues || []

  cmdResponse = status === 200
    ? { exitCode: 0, message: '' }
    : { exitCode: 127, message: 'There was an error while retrieving your worklogs.' }

  issues = issues.map(entry => {
    return [
      entry.key,
      moment.duration({ seconds: entry.fields.timespent }).format('HH[h] mm[m]')
    ]
  })

  table.push(...issues)
  process.stdout.write(`${table.toString()}\n`)
}

module.exports = async options => {
  await getIssueWorklogs(options.issue)
  await getDaySummary(options.date, options.author)

  if (cmdResponse.exitCode > 0) process.stdout.write(`${cmdResponse.message}\n`)
  process.exit(cmdResponse.exitCode)
}
