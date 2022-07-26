#!/usr/bin/env node
import * as yargs from 'yargs-parser'
import yargsParser = require('yargs-parser')
import * as semver from 'semver'
import init from '../cli/init.js'
import { logger } from '../cli/util'

const args: yargsParser.Arguments = yargs(process.argv.slice(2))
const version = require('../package').version

if (args.v || args.version) {
  console.log(version)
  process.exit(0)
}

if (semver.lt(process.version, '14.18.0')) {
  logger.error(
    `doohickey requires node.js 14.18.x or up. You are currently running
    ${process.version}. Please upgrade to a safe, secure version of nodejs!`
  )
  process.exit(1)
}

const option = args._[0]

switch (option) {
  case 'init':
    if (args.h || args.help) {
      console.log(`
Usage:  doohickey init [OPTIONS]

Options:
  [defalut]          'doohickey init' contains all options below
  -e, --eslint       add the ESLint configuration to project
  -p, --prettier     add the Prettier configuration to project
  -s, --stylelint    add the Prettier configuration to project
  -l, --lintstaged   add the Lint-staged configuration to project
  -k, --husky        add the .husky directory to project and init git hooks
        `)
      break
    }
    init(args)
    break
  case 'verify-commit':
    if (args.h || args.help) {
      console.log(`This command takes no options`)
      break
    }
    // ingore other options
    require('../cli/verify-commit-msg')
    break
  default:
    if (args.h || args.help) {
      console.log(`
Usage:  doohickey COMMAND [OPTIONS]

A quick configuration tool for react app

Options:
  -h, --help
  -v, --version

Commands:
  init              initialize prettier、eslint、stylelint、lint-staged、husky
  verifyCommitMsg   verify git commit message

Run 'doohickey COMMAND --help' for more information on a command.
        `)
    } else {
      console.log(`
doohickey: '${option}' is not a doohickey command.
See 'doohickey --help'
      `)
    }
    break
}
