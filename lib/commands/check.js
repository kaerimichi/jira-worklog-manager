#!/usr/bin/env node

const moment = require('moment')
const service = require('../serviceHandler')()
const Table = require('cli-table')

module.exports = async options => {
  try {
    const issueId = options.issue
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
    throw e
  }
}
