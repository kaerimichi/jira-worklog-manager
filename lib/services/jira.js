require('moment-duration-format')

const axios = require('axios')
const moment = require('moment-timezone')
const { getIntervalAsSeconds } = require('../helpers/timeCalc')

module.exports = class JiraIntegrationService {
  constructor (url, token) {
    if (!url || !token) {
      throw new Error('ERROR: Jira credentials are not valid.')
    }
    this.url = url
    this.token = token
    this.jiraService = axios.create({
      baseURL: `${url}/rest/api/2/`,
      headers: {
        'Authorization': `Basic ${token}`
      },
    })
  }

  retrieveWorklogsFromIssue (issue) {
    return this.jiraService.get(`issue/${issue}`)
  }

  async retrieveWorklogs (date) {
    const worklogDate = date ? moment(date, 'DD/MM/YYYY') : moment()
    const queryDate = worklogDate.format('YYYY-MM-DD')
    const myself = await this.jiraService.get('myself')
    const filterConditionJson = {
      groupUsers: [`users:${myself.data.key}`],
      worklogStartDate: queryDate,
      worklogEndDate: queryDate
    }

    let jiraTimetracker = axios.create({
      baseURL: `${this.url}/rest/jttp-rest/1/`,
      headers: {
        'Authorization': `Basic ${this.token}`
      }
    })
    return jiraTimetracker.get(
      `worklog-query/worklogQuery?filterConditionJson=${JSON.stringify(filterConditionJson)}`
    )
  }

  registerWorklog ({ issue, start, end, date, duration, comment }) {
    const actualStart = start || moment().format('HH:mm')
    const actualEnd = end || moment(actualStart, 'HH:mm').add(duration, 'minutes').format('HH:mm')
    const finalDate = date
      ? moment(`${date} ${actualStart}`, 'DD/MM HH:mm')
      : moment()
    const startTime = moment.tz(finalDate, moment.tz.guess())
    const payload = {
      started: startTime.format(`${moment.HTML5_FMT.DATETIME_LOCAL_MS}ZZ`),
      timeSpentSeconds: duration ? duration * 60 : getIntervalAsSeconds(actualStart, actualEnd)
    }

    if (comment) payload.comment = comment

    return this.jiraService.post(`issue/${issue}/worklog`, payload)
  }
}
