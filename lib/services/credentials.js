const homedir = require('os').homedir()
const { readFileSync, existsSync, writeFileSync } = require('fs')
const { join } = require('path')
const { Buffer } = require('buffer')
const configFilePath = join(homedir, '.jwmrc')

module.exports = class CredentialsService {
  constructor () {
    const configFileContents = existsSync(configFilePath)
      ? readFileSync(configFilePath, 'utf8')
      : null

    this.url = null
    this.token = null

    if (configFileContents) {
      const { url, token } = JSON.parse(configFileContents)

      this.url = url
      this.token = token
    }
  }

  storeConfig ({ url, username, password }) {
    try {
      const token = Buffer.from(`${username}:${password}`).toString('base64')
      const config = { url, token }

      writeFileSync(configFilePath, `${JSON.stringify(config)}\n`, 'utf8')

      return this
    } catch (e) {
      throw e
    }
  }

  getUrl () {
    return this.url
  }

  getToken () {
    return this.token
  }

  credentialsAreValid () {
    return this.url && this.token
  }
}
