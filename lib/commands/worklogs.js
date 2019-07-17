#!/usr/bin/env node

const moment = require('moment')
const Table = require('cli-table')
const { flatten } = require('lodash')

module.exports = async (options, { jira }) => {
  try {
    const dateFormatParser = 'MMM DD, YYYY, h:mm:ss a'
    const getWorklogRetrievalPromises = options => {
      const periodType = options.week
        ? 'isoWeek'
        : options.month
          ? 'month'
          : null
      let promises = []

      if (periodType) {
        const startOfPeriod = moment().startOf(periodType)
        const endOfPeriod = moment().endOf(periodType)
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
    let worklogs = flatten(
      results.map(({ data }) => data).filter(e => e.length > 0)
    ).map(e => e.details)
    let table = new Table({
      head: ['Updated at', 'Issue', 'Start', 'End', 'Duration', 'Description'],
      colWidths: [12, 16, 12, 12, 12, 44]
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
        worklogStartDate.format('DD/MM'),
        entry.issueKey,
        worklogStartDate.format('HH:mm'),
        worklogStartDate.add(entry.worklogTimeWorked, 'seconds').format('HH:mm'),
        workDuration.format('h[h] m[m]'),
        entry.worklogBody || '----'
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
