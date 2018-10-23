#!/usr/bin/env node

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
  .option('-c, --comment [comment]', 'work log comment')
  .action(options => run('register', options))

program
  .command('bulk-register')
  .option('-f, --filename [filename]', 'path to a YAML file with the worklogs')
  .option('--dry-run', 'list work logs to be registered without actually registering them')
  .action(options => run('bulkRegister', options))

program
  .command('worklogs')
  .option('-d, --date [date]', 'optional worklog date (DD/MM/YYYY), defaults to current date')
  .action(options => run('worklogs', options))

program.parse(process.argv)
