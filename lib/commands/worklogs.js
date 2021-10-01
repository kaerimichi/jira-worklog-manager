#!/usr/bin/env node

const moment = require('moment')
const Table = require('cli-table')
const { flatten } = require('lodash')

module.exports = async (options, { jira }) => {
  try {
    const getWorklogRetrievalPromises = options => {
      const periodType = options.week
        ? 'isoWeek'
        : options.month
          ? 'month'
          : options.prevMonth
            ? 'prevMonth'
            : null
      let promises = []

      if (periodType) {
        const startOfPeriod = periodType !== 'prevMonth'
          ? moment().startOf(periodType)
          : moment().subtract(1, 'months').startOf('month')
        const endOfPeriod = periodType !== 'prevMonth'
          ? moment().endOf(periodType)
          : moment().subtract(1, 'months').endOf('month')

        let days = []
        let day = startOfPeriod

        while (day <= endOfPeriod) {
          days.push(moment(day.toDate()))
          day = day.clone().add(1, 'd')
        }

        promises = days.map(e => jira.retrieveWorklogs(e.format('DD/MM')))
      } else {
        promises.push(jira.retrieveWorklogs(options.date))
      }

      return Promise.all(promises)
    }
    const results = await getWorklogRetrievalPromises(options)
    let worklogs = flatten(results.filter(e => e && e.length > 0))
    let table = new Table({
      head: ['Updated at', 'Issue', 'Start', 'End', 'Duration', 'Description'],
      colWidths: [12, 16, 12, 12, 12, 44]
    })

    worklogs.sort((a, b) => {
      return moment(a.started).format('X') - moment(b.started).format('X')
    })

    let worklogTimeSum = 0
    worklogs = worklogs.map(entry => {
      worklogTimeSum += entry.timeSpentSeconds
      let worklogStartDate = moment(entry.started)
      let workDuration = moment.duration(entry.timeSpentSeconds, 'seconds')

      return [
        worklogStartDate.format('DD/MM'),
        entry.issueKey,
        worklogStartDate.format('HH:mm'),
        worklogStartDate.add(entry.timeSpentSeconds, 'seconds').format('HH:mm'),
        workDuration.format('h[h] m[m]'),
        entry.comment || '----'
      ]
    })

    table.push(...worklogs)
    let workDurationSum = moment.duration(worklogTimeSum, 'seconds')
    table.push([], ['', '', '', '', workDurationSum.format('h[h] m[m]'), ''])
    process.stdout.write(`${table.toString()}\n`)
  } catch (e) {
    throw e
  }
}
