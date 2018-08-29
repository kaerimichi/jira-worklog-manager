const axios = require('axios')

module.exports = () => {
  return axios.create({
    baseURL: `${process.env.JIRA_API_URL}/rest/api/2/`,
    headers: {
      'Authorization': `Basic ${process.env.JIRA_API_TOKEN}`
    }
  })
}
