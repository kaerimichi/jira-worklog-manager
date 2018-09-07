const axios = require('axios')
const { join } = require('path')
const { existsSync, readFileSync } = require('fs')
const homedir = require('os').homedir()
const configFilePath = join(homedir, '.jwmrc')

function getCredentials () {
  try {
    const { JIRA_API_URL, JIRA_API_TOKEN } = process.env

    return existsSync(configFilePath)
      ? JSON.parse(readFileSync(configFilePath))
      : JIRA_API_URL && JIRA_API_TOKEN
        ? { url: JIRA_API_URL, token: JIRA_API_TOKEN }
        : null
  } catch (e) {
    throw e
  }
}

module.exports = () => {
  const credentials = getCredentials()

  if (!credentials) {
    throw new Error('Error: Jira Worklog Manager was not configured properly.')
  }

  return axios.create({
    baseURL: `${credentials.url}/rest/api/2/`,
    headers: {
      'Authorization': `Basic ${credentials.token}`
    }
  })
}
