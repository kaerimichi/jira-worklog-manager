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

function addMinutesToShortTime (shortTime = '00:00', minutes = 0) {
  return moment(shortTime, 'HH:mm').add(minutes, 'minutes').format('HH:mm')
}

module.exports = {
  getIntervalAsSeconds,
  addMinutesToShortTime
}
