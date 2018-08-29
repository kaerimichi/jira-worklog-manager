# Jira Worklog Manager

A command line tool to register and retrieve work logs from an issue. It works like the [Timetracker plugin](https://marketplace.atlassian.com/apps/1211243/timetracker-time-tracking-reporting?hosting=server&tab=overview) ;)

## Motivation

This is a tool built on top of the revolutionary programming approach in which a developer feels very angry because he wants to perform some task that is dead simple and yet there are no convenient way to achieve this. This paradigm is also known as **WDD - Wrath Driven Development**.

## Installation

```
npm i -g jira-worklog-manager
```

## Configuration

Set the following environment variables:

- `JIRA_API_URL` with the Jira server URL
- `JIRA_API_TOKEN` with your HTTP basic auth token

## Usage

### Work log registration

```
Usage: register [options]

Options:

-d, --date [date]    worklog date (DD/MM)
-s, --start [start]  start time (HH:mm)
-e, --end [end]      end time (HH:mm)
-i, --issue [issue]  issue identifier
-h, --help           output usage information
```

### Work log retrieval

```
Usage: check [options]

Options:

-i, --issue [issue]  issue identifier
-h, --help           output usage information
```

## Coming soon!

- bulk work log registration
- a proper way to configure your Jira credentials