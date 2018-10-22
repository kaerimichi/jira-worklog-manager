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
      colWidths: [12, 10, 10, 17, 30],
    })

    let worklogTimeSum = 0;
    worklogs = worklogs.map(entry => {
      worklogTimeSum += entry.worklogTimeWorked
      let worklogStartDate = moment(entry.worklogStartDate, dateFormatParser)
      let workDuration = moment.duration(entry.worklogTimeWorked, 'seconds')
      return [
        entry.issueKey,
        worklogStartDate.format('HH:mm'),
        worklogStartDate.add(entry.worklogTimeWorked, 'seconds').format('HH:mm'),
        `${workDuration.hours()}h ${workDuration.minutes()}m (${entry.worklogTimeWorked / 60 / 60}h)`,
        entry.worklogBody.length > 0 ? entry.worklogBody : '----',
      ]
    })
    table.push(...worklogs)
    let workDurationSum = moment.duration(worklogTimeSum, 'seconds')
    table.push([
      '-',
      '-',
      '-',
      `${workDurationSum.hours()}h ${workDurationSum.minutes()}m (${worklogTimeSum / 60 / 60}h)`,
      '----',
    ])
    process.stdout.write(`${table.toString()}\n`)
  }
  catch (e) {
    throw e
  }
}
