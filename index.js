#!/usr/bin/env node

require('dotenv').config()

const program = require('commander')

program.version('1.0.10')

program
  .command('check')
  .option('-i, --issue [issue]', 'issue identifier')
  .action(options => require('./lib/commands/check')(options))

program
  .command('register')
  .option('-d, --date [date]', 'worklog date (DD/MM)')
  .option('-s, --start [start]', 'start time (HH:mm)')
  .option('-e, --end [end]', 'end time (HH:mm)')
  .option('-i, --issue [issue]', 'issue identifier')
  .action(options => require('./lib/commands/register')(options))

program.parse(process.argv)
