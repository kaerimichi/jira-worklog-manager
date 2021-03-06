# Jira Worklog Manager

A command line tool to register and retrieve work logs from an issue. It works pretty much like the [Timetracker plugin](https://marketplace.atlassian.com/apps/1211243/timetracker-time-tracking-reporting?hosting=server&tab=overview) ;)

## Installation

```
npm i -g jira-worklog-manager
```

## Configuration

Run the following command:

```
$ jira-worklog-manager configure
```

### Generating an API token

Basic authentication in Jira using password is now deprecated so you should generate an API token to configure the application. Follow the [instructions](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/) to generate an API token.

## Usage

### Work log registration

```
Usage: jira-worklog-manager register [options]

Options:
  -d, --date [date]        worklog date (DD/MM)
  -s, --start [start]      start time (HH:mm)
  -e, --end [end]          end time (HH:mm)
  -i, --issue [issue]      issue identifier
  -c, --comment [comment]  work log comment
  -h, --help               output usage information
```

### Bulk work log registration

```
Usage: jira-worklog-manager bulk-register [options]

Options:
  -f, --filename [filename]     path to a YAML file with the worklogs
  --dry-run                     list work logs to be registered without actually registering them
  --remove-registered-worklogs  remove registered entries in YAML file
  -h, --help                    output usage information
```

You can bulk register your work logs with a YAML file like in the example below:

```
tasks:
  - issueId: ABCDE-0101
    alias: SOME_COMMON_TASK
  - issueId: ABCDE-0202
    alias: ANOTHER_COMMON_TASK
summary:
  - date: 10/08
    worklogs:
      - issueId: ABCDE-1234
        start: 10h00
        end: 10h30
        comment: 'Work log comment (optional)'
      - issueId: ABCDE-5678, EDCBA-9999
        start: 12h00
        end: 13h30
  - date: 11/08
    worklogs:
      - issueId: ABCDE-0101
        duration: 35
      - issueId: SOME_COMMON_TASK, ANOTHER_COMMON_TASK
        duration: 2h
```

Note: You can either use `start` / `end` or `duration` (minutes) to register in bulk mode. You can also use aliases to reference some task that you work very often and repeat several times in the YAML file, the alias will be replaced by the specified issue in the "tasks" session.

You can also specify several issues on bulk register. The total time of the specified interval will be splitted and several worklogs will be registered matching the number of issues. For example, let's say that you've worked on two issues from 13h to 14h (one hour). If you specify them separated by comma in the `issueId` field, 30 minutes will be logged for each one.

### Work log retrieval of a given issue

```
Usage: jira-worklog-manager check [options]

Options:
  -i, --issue [issue]  issue identifier
  -h, --help           output usage information
```

### Work log retrieval of a given date

You can retrieve all work logs of a given date (defaults to current day if not specified)

```
Usage: jira-worklog-manager worklogs [options]

Options:
  -d, --date [date]  optional worklog date (DD/MM/YYYY), defaults to current date
  --week             list work logs of the current week
  --month            list work logs of the current month
  -h, --help         output usage information

``` 
