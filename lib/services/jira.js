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

    //For some reason, API returns data for the day after the day requested for
    //'worklog-query' end-point
    worklogDate.subtract(1, 'days')
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
    return jiraTimetracker.get(`worklog-query/worklogQuery?filterConditionJson=${JSON.stringify(filterConditionJson)}`)
  }

  registerWorklog ({ issue, start, end, date, comment }) {
    const finalDate = date
      ? moment(`${date} ${start}`, 'DD/MM HH:mm')
      : moment()
    const startTime = moment.tz(finalDate, moment.tz.guess())
    const payload = {
      started: startTime.format(`${moment.HTML5_FMT.DATETIME_LOCAL_MS}ZZ`),
      timeSpentSeconds: getIntervalAsSeconds(start, end)
    }

    if (comment) {
      payload.comment = comment
    }

    return this.jiraService.post(`issue/${issue}/worklog`, payload)
  }
}
