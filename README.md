# Jira Worklog Manager

A command line tool to register and retrieve work logs from an issue. It works pretty much like the [Timetracker plugin](https://marketplace.atlassian.com/apps/1211243/timetracker-time-tracking-reporting?hosting=server&tab=overview) ;)

## Motivation

This is a tool built on top of the revolutionary programming approach in which a developer feels very angry because he wants to perform some task that is dead simple and yet there is no convenient way to achieve this. This paradigm is also known as **WDD - Wrath Driven Development**.

## Installation

```
npm i -g jira-worklog-manager
```

## Configuration

Run the following command:

```
$ jira-worklog-manager configure
```

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

-f, --filename [filename]  path to a YAML file with the worklogs
--dry-run                  list work logs to be registered without actually registering them
-h, --help                 output usage information
```

You can bulk register your work logs with a YAML file like in the example below:

```
summary:
- date: 10/08
  worklogs:
  - issueId: ABCDE-1234
    start: 10h00
    end: 10h30
    comment: 'Work log comment (optional)'
  - issueId: ABCDE-5678
    start: 12h00
    end: 13h30
- date: 11/08
  worklogs:
  - issueId: ABCDE-0101
    start: 10h15
    end: 10h30
```

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

  -d, --date [date]  Optional worklog date (DD/MM), defaults to current date
  -h, --help         output usage information

``` 
