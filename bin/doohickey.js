#!/usr/bin/env node
const yargs = require('yargs-parser')
const init = require('../cli/init')

const args = yargs(process.argv.slice(2))

if (args.v || args.version) {
  console.log(require('../package').version)
  process.exit(0)
}

const option = args._[0]

switch (option) {
  case 'init':
    if (args.h || args.help) {
      console.log(`
Usage:  doohickey init [OPTIONS]

Options:
  -e, --eslint       add the ESLint configuration to project
  -p, --prettier     add the Prettier configuration to project
  -s, --stylelint    add the Prettier configuration to project
  -l, --lintstaged   add the Lint-staged configuration to project
  -k, --husky        add the .husky to project
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
    require('../cli/verifyCommitMsg')
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
