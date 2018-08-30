#!/usr/bin/env node

const moment = require('moment')
const service = require('../serviceHandler')()
const Table = require('cli-table')

async function getIssueWorklogs (issueId) {
  try {
    const { data } = await service.get(`issue/${issueId}`)
    let worklogs = data.fields.worklog.worklogs || []
    const table = new Table({
      head: ['Created by', 'Updated by', 'Registered at', 'Work log'],
      colWidths: [24, 24, 32, 12]
    })

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
  } catch (e) {
    process.stderr.write(`${e.message}\n`)
    process.exit(1)
  }
}

module.exports = async options => {
  await getIssueWorklogs(options.issue)
}
