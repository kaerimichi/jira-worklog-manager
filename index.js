require('dotenv').config()

const program = require('commander')

program
  .version('0.1.2')
  .command('register', 'register a worklog period')
  .command('check', 'check issue worklog')
  .parse(process.argv)
