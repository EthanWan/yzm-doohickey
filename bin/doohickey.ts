#!/usr/bin/env node

import * as yargs from 'yargs-parser'
import yargsParser = require('yargs-parser')
import * as semver from 'semver'
import verifyCommitMsg from '../cli/verify-commit-msg'
import init from '../cli/init.js'
import { logger, runSpawn as run } from '../cli/util'

const args: yargsParser.Arguments = yargs(process.argv.slice(2))
const flags: string[] = process.argv.slice(3)
const version: string = require('../../package').version

if (args.v || args.version) {
  logger.log(version)
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
      logger.log(`
Usage:  doohickey init [OPTIONS]

Options:
  [defalut]          'doohickey init' contains all options below.
  -e, --eslint       Add the ESLint configuration to project.
  -p, --prettier     Add the Prettier configuration to project.
  -s, --stylelint    Add the Stylelint configuration to project.
  -l, --lintstaged   Add the Lint-staged configuration to project.
  -k, --husky        Add the .husky directory to project and init git hooks.
        `)
      break
    }
    init(args)
    break
  case 'lint:js':
    run('node', ['./node_modules/eslint/bin/eslint', ...flags], true).catch(console.log)
    break
  case 'lint:prettier':
    run('node', ['./node_modules/prettier/bin-prettier', ...flags], true).catch(
      console.log
    )
    break
  case 'lint:style':
    run('node', ['./node_modules/stylelint/bin/stylelint', ...flags], true).catch(
      console.log
    )
    break
  case 'verifyCommitMsg':
    if (args.h || args.help) {
      logger.log(`
Usage:  doohickey verifyCommitMsg [OPTIONS]

Options:
  -e, --edit   read last commit message from the specified file or fallbacks to ./.git/COMMIT_EDITMSG.
       `)
      break
    }

    if (args.e || args.edit) {
      verifyCommitMsg(args.e || args.edit)
      break
    }
    logger.log(`
doohickey verifyCommitMsg must have option -e or --edit.
`)
    break
  default:
    if (args.h || args.help) {
      logger.log(`
Usage:  doohickey COMMAND [OPTIONS]

A quick configuration tool for react app

Options:
  -h, --help
  -v, --version

Commands:
  init              Generate configuration and adds npm scripts to package.json.
  lint:js           Lint code issues by eslint.
  lint:prettier     Checks code for formatting by prettier.
  lint:style        Checks CSS code for formatting and lint issues by stylelint.
  verifyCommitMsg   Verify git commit message.

Run 'doohickey COMMAND --help' for more information on a command.
        `)
    } else {
      logger.log(`
doohickey: '${option}' is not a doohickey command.
See 'doohickey --help'
      `)
    }
    break
}
