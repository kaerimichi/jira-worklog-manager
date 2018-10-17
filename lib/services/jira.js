require('moment-duration-format')

const axios = require('axios')
const moment = require('moment-timezone')
const { getIntervalAsSeconds } = require('../helpers/timeCalc')

module.exports = class JiraIntegrationService {
  constructor (url, token) {
    if (!url || !token) {
      throw new Error('ERROR: Jira credentials are not valid.')
    }

    this.jiraService = axios.create({
      baseURL: `${url}/rest/api/2/`,
      headers: {
        'Authorization': `Basic ${token}`
      }
    })
  }

  retrieveWorklogsFromIssue (issue) {
    return this.jiraService.get(`issue/${issue}`)
  }

  registerWorklog ({ issue, start, end, date, comment }) {
    const finalDate = date ? moment(`${date} ${start}`, 'DD/MM HH:mm') : moment()
    const startTime = moment.tz(finalDate, moment.tz.guess())
    const payload = {
      started: startTime.format(`${moment.HTML5_FMT.DATETIME_LOCAL_MS}ZZ`),
      timeSpentSeconds: getIntervalAsSeconds(start, end)
    }

    if (comment) payload.comment = comment

    return this.jiraService.post(`issue/${issue}/worklog`, payload)
  }
}
