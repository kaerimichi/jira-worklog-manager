require('moment-duration-format')

const axios = require('axios')
const moment = require('moment-timezone')
const { getIntervalAsSeconds } = require('../helpers/timeCalc')
const { DEFAULT_START_TIME = '09:00' } = process.env

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
    const { data: myselfData } = await this.jiraService.get('myself')
    const jiraAccountId = myselfData.accountId
    let { data: rawSearch } = await this.jiraService.get(
      'search?' +
      [
        'startIndex=0',
        'maxResults=1000',
        `jql=worklogAuthor=${jiraAccountId}+and+worklogDate=${queryDate}`
      ].join('&')
    )
    let issueKeys = rawSearch.issues.map(e => e.key)
    let worklogs = await Promise.all(
      issueKeys.map(issueKey => {
        return this.jiraService.get(`issue/${issueKey}/worklog`)
          .then(({ data: worklogsData }) => {
            if (worklogsData.total === 0) return []
            return { issueKey, worklogs: worklogsData.worklogs }
          })
      })
    )
    
    worklogs = worklogs.reduce((acc, { issueKey, worklogs }) => {
      acc[issueKey] = worklogs
      return acc
    }, {})

    return rawSearch.issues.length > 0
      ? rawSearch.issues.reduce((acc, issue) => {
          const issueKey = issue.key
          const userWorklogs = worklogs[issueKey]
            .filter(e => {
              return e.author.accountId === jiraAccountId
                && moment(e.started).format('YYYY-MM-DD') === queryDate
            })
            .map(e => {
              e.issueKey = issueKey
              return e
            })

          acc.push(...userWorklogs)

          return acc
        }, [])
      : null
  }

  registerWorklog ({ issue, start, end, date, duration, comment }) {
    const actualStart = start || moment(DEFAULT_START_TIME, 'HH:mm').format('HH:mm')
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
