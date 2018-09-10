#!/usr/bin/env node

const homedir = require('os').homedir()
const { readFileSync, existsSync, writeFileSync } = require('fs')
const { join } = require('path')
const { prompt } = require('inquirer')
const { Buffer } = require('buffer')
const configFilePath = join(homedir, '.jwmrc')

function getConfigFile () {
  try {
    return readFileSync(configFilePath, 'utf8')
  } catch (e) {
    return null
  }
}

function saveConfigFile ({ url, username, password }) {
  try {
    const token = Buffer.from(`${username}:${password}`).toString('base64')
    const config = { url, token }

    writeFileSync(configFilePath, `${JSON.stringify(config)}\n`, 'utf8')
  } catch (e) {
    throw e
  }
}

module.exports = async options => {
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

    if (getConfigFile()) {
      prompt(questions.overwriteWarning).then(answers => {
        if (answers.overwrite) {
          prompt(questions.configuration).then(saveConfigFile)
        }
      })
    } else {
      prompt(questions.configuration).then(saveConfigFile)
    }
  } catch (e) {
    throw e
  }
}
