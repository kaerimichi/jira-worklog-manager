#!/usr/bin/env node

const moment = require('moment')
const Table = require('cli-table')

module.exports = async (options, { jira }) => {
  try {
    const dateFormatParser = 'MMM DD, YYYY, h:mm:ss a'
    const { data } = await jira.retrieveWorklogs(options.date)
    let worklogs = data.map(entry => {
      return entry.details
    })
    const table = new Table({
      head: ['Issue', 'Start', 'End', 'Duration', 'Description'],
      colWidths: [16, 10, 10, 12, 44]
    })

    worklogs.sort((a, b) => {
      return moment(a.worklogStartDate, dateFormatParser).format('X') -
        moment(b.worklogStartDate, dateFormatParser).format('X')
    })

    let worklogTimeSum = 0
    worklogs = worklogs.map(entry => {
      worklogTimeSum += entry.worklogTimeWorked
      let worklogStartDate = moment(entry.worklogStartDate, dateFormatParser)
      let workDuration = moment.duration(entry.worklogTimeWorked, 'seconds')

      return [
        entry.issueKey,
        worklogStartDate.format('HH:mm'),
        worklogStartDate.add(entry.worklogTimeWorked, 'seconds').format('HH:mm'),
        workDuration.format('h[h] m[m]'),
        entry.worklogBody || '----'
      ]
    })

    table.push(...worklogs)
    let workDurationSum = moment.duration(worklogTimeSum, 'seconds')
    table.push([], [
      'Total',
      '-',
      '-',
      workDurationSum.format('h[h] m[m]'),
      '-'
    ])
    process.stdout.write(`${table.toString()}\n`)
  } catch (e) {
    throw e
  }
}
