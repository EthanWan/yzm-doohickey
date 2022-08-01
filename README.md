# yzm-doohickey

Some configuration gadgets of the react project mainly include some lint rules of javascript, typescript, jsx, code formatting rules, css rules, git commit rules, etc. By eliminating some repetitive code rules configuration at the beginning of the developer project, you can focus more on business development. For specific rules, please refer to the standard directory.

## Installed

```bash
npm i yzm-doohickey --save-dev
# or
yarn add yzm-doohickey -D
```

## Usage

通过如下命令初始化所有配置项，包含`.eslintrc.js`、`.perttierrc.js`、`.stylelintrc.js`、`.husky` and npm scripts `lint-staged`

```bash
doohickey init
```

## Other

可以通过如下命令查看所有 cli 选项

```bash
doohickey --help
```

```bash
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
```

## LICENSE

[MIT](./LICENSE)
