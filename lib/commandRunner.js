const JiraIntegrationService = require('./services/jira')
const QueueService = require('./services/queue')
const CredentialsService = require('./services/credentials')

module.exports = {
  run: async (commandName, options) => {
    try {
      const credentialsService = new CredentialsService()
      const services = {
        credentials: credentialsService
      }

      if (commandName !== 'configure') {
        services.queue = new QueueService()
        services.jira = new JiraIntegrationService(
          credentialsService.getUrl(),
          credentialsService.getToken()
        )
      }

      await require(`./commands/${commandName}`)(options, services)
    } catch (e) {
      process.stderr.write(`${e.message}\n`)
      process.exit(127)
    }
  }
}
