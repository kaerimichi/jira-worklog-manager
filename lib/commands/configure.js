#!/usr/bin/env node

const { prompt } = require('inquirer')

module.exports = async (options, { credentials }) => {
  try {
    const questions = {
      overwriteWarning: [
        { name: 'overwrite', message: 'Would you like to reconfigure?', type: 'confirm' }
      ],
      configuration: [
        { name: 'url', message: 'Your Jira server URL:' },
        { name: 'username', message: 'Your Jira username:' },
        { name: 'password', message: 'Your Jira password:', type: 'password' }
      ]
    }

    if (credentials.credentialsAreValid()) {
      prompt(questions.overwriteWarning).then(answers => {
        if (answers.overwrite) {
          prompt(questions.configuration).then(credentials.storeConfig)
        }
      })
    } else {
      prompt(questions.configuration).then(credentials.storeConfig)
    }
  } catch (e) {
    throw e
  }
}
