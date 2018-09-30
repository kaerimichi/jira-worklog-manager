#!/usr/bin/env node

module.exports = async (options, { jira }) => {
  try {
    await jira.registerWorklog(options)
  } catch (e) {
    throw e
  }
}
