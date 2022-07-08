
import ora from 'ora'
import { exec, spawn } from 'child_process'
import chalk from "chalk"

const spinner = ora()

export async function run(cmd) {
  console.log(chalk.bgYellow.black(' EXECTING ') + ' ' + chalk.yellow(cmd))
  spinner.start()
  spinner.color = 'yellow'

  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) {
        return reject(err)
      }
      spinner.text = chalk.yellow(stdout)
      // console.log(stdout)
      spinner.stop()
      resolve()
    })
  })
}
