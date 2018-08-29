#!/usr/bin/env node

require('moment-duration-format')

const program = require('commander')
const service = require('./lib/serviceHandler')()
const moment = require('moment')

function getMinutesByShortTime (shortTime) {
  const [ hours, minutes ] = shortTime.split(':')
  return moment.duration({ hours, minutes }).asMinutes()
}

function getIntervalAsSeconds (startTime = '00:00', endTime = '00:00') {
  startTime = getMinutesByShortTime(startTime)
  endTime = getMinutesByShortTime(endTime)
  return moment.duration(endTime - startTime, 'minutes').asSeconds()
}

program
  .option('-d, --date [date]', 'worklog date (DD/MM)')
  .option('-s, --start [start]', 'start time (HH:mm)')
  .option('-e, --end [end]', 'end time (HH:mm)')
  .option('-i, --issue [issue]', 'issue identifier')
  .parse(process.argv)

async function register (program) {
  const payload = {
    started: moment(`${program.date} ${program.start}`, 'DD/MM HH:mm').format(moment.HTML5_FMT.DATETIME_LOCAL_MS) + '-0300',
    timeSpentSeconds: getIntervalAsSeconds(program.start, program.end)
  }
  const { status } = await service.post(`issue/${program.issue}/worklog`, payload)
  const cmdResponse = status === 201
    ? { exitCode: 0, message: `Worklog successfully registered on ${program.issue}!` }
    : { exitCode: 127, message: 'There was an error while registering your worklog.' }

  process.stdout.write(`${cmdResponse.message}\n`)
  process.exit(cmdResponse.exitCode)
}

register(program)
