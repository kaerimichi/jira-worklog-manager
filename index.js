#!/usr/bin/env node

require('dotenv').config()

const program = require('commander')
const { run } = require('./lib/commandRunner')

program.version(require('./package.json').version)

program
  .command('configure')
  .action(options => run('configure', options))

program
  .command('check')
  .option('-i, --issue [issue]', 'issue identifier')
  .action(options => run('check', options))

program
  .command('register')
  .option('-d, --date [date]', 'worklog date (DD/MM)')
  .option('-s, --start [start]', 'start time (HH:mm)')
  .option('-e, --end [end]', 'end time (HH:mm)')
  .option('-i, --issue [issue]', 'issue identifier')
  .action(options => run('register', options))

program
  .command('bulk-register')
  .option('-f, --filename [filename]', 'path to a YAML file with the worklogs')
  .option('--dry-run', 'list work logs to be registered without actually registering them')
  .action(options => run('bulkRegister', options))

program.parse(process.argv)
