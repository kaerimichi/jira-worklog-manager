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

module.exports = async options => {
  try {
    const payload = {
      started: moment(`${options.date} ${options.start}`, 'DD/MM HH:mm').format(moment.HTML5_FMT.DATETIME_LOCAL_MS) + '-0300',
      timeSpentSeconds: getIntervalAsSeconds(options.start, options.end)
    }

    await service.post(`issue/${options.issue}/worklog`, payload)
  } catch (e) {
    throw e
  }
}
