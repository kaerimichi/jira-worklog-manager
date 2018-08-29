#!/usr/bin/env node

require('moment-duration-format')

const service = require('../serviceHandler')()
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

async function register (options) {
  const payload = {
    started: moment(`${options.date} ${options.start}`, 'DD/MM HH:mm').format(moment.HTML5_FMT.DATETIME_LOCAL_MS) + '-0300',
    timeSpentSeconds: getIntervalAsSeconds(options.start, options.end)
  }
  const { status } = await service.post(`issue/${options.issue}/worklog`, payload)
  const cmdResponse = status === 201
    ? { exitCode: 0, message: `Worklog successfully registered on ${options.issue}` }
    : { exitCode: 127, message: 'There was an error while registering your worklog.' }

  process.stdout.write(`${cmdResponse.message}\n`)
  process.exit(cmdResponse.exitCode)
}

module.exports = async options => {
  await register(options)
}
