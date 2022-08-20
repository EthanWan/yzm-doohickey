import * as fs from 'fs'
import chalk = require('chalk')
import { cosmiconfig } from 'cosmiconfig'

interface DoohickeyConfig {
  gitCommitMsg: {
    scopes: string[]
    subjectLength: number
  }
}

function getCommitRE(config: DoohickeyConfig): RegExp {
  let commitRE =
    /^(v\d+\.\d+\.\d+(-(alpha|beta|rc.\d+))?)|((revert: )?(feat|fix|docs|style|refactor|perf|test|workflow|ci|chore|types)(\(.+\))?!?: .{1,50})/

  if (config?.gitCommitMsg) {
    const scopes = config.gitCommitMsg?.scopes
    const subjectLength = config.gitCommitMsg?.subjectLength

    if (scopes && !Array.isArray(scopes)) {
      console.error(
        `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(' scopes must be a array type')}`
      )
      process.exit(1)
    }

    if (subjectLength && typeof subjectLength != 'number') {
      console.error(
        `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
          ' subjectLength must be a number type'
        )}`
      )
      process.exit(1)
    }

    commitRE = new RegExp(
      `^(v\\d+\\.\\d+\\.\\d+(-(alpha|beta|rc.\\d+))?)|((revert: )?(feat|fix|docs|style|refactor|perf|test|workflow|ci|chore|types)(\\(${
        scopes ? scopes.join('|') : '.+'
      }\\))${scopes ?? '?'}!?: .{1,${subjectLength ?? 50}})`
    )
  }

  return commitRE
}

async function verifyCommitMsg(msgPath: string) {
  const msg = fs.readFileSync(msgPath, 'utf-8').trim()

  const explorer = cosmiconfig('doohickey', {
    searchPlaces: ['package.json'],
  })

  const file = await explorer.search().catch(err => {
    return Promise.reject(err)
  })

  // doohickey config
  const config: DoohickeyConfig = file?.config
  const commitRE = getCommitRE(config)

  if (!commitRE.test(msg)) {
    console.log()
    console.error(
      `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
        `invalid commit message format.`
      )}\n\n` +
        chalk.red(
          `  Proper commit message format is required for automated changelog generation. Examples:\n\n`
        ) +
        `    ${chalk.green(`feat(compiler): add 'comments' option`)}\n` +
        `    ${chalk.green(`fix(model): handle events on blur (close #28)`)}\n\n` +
        chalk.red(`  See .github/COMMIT_CONVENTION.md for more details.\n`) +
        chalk.red(
          `  You can also use ${chalk.cyan(
            `npm run commit`
          )} to interactively generate a commit message.\n`
        )
    )
    process.exit(1)
  }
}

export default verifyCommitMsg
