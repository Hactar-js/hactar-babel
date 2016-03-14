import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import json5 from 'json5'
import { execSync } from 'child_process'
import { checkIfPackageIsInstalled, parseFile, isES62015, isStage0, isReact } from 'hactar-util'

const getBabelConfig = () => {
  const babelConfigPath = path.join(process.cwd(), '/.babelrc')

  try {
    fs.accessSync(babelConfigPath, fs.F_OK)
  } catch (e) {
    return {
      presets: [],
    }
  }

  const contents = fs.readFileSync(babelConfigPath, 'utf8')
  const babelConfig = json5.parse(contents)

  if (!babelConfig.presets) {
    /* eslint-disable dot-notation */
    babelConfig['presets'] = []
    /* eslint-enable */
  }

  return babelConfig
}

const writeBabelConfig = babelConfig => {
  const babelConfigPath = path.join(process.cwd(), '/.babelrc')

  console.log('writing babel config')

  try {
    fs.writeFileSync(babelConfigPath, json5.stringify(babelConfig, null, 2), 'utf8')
    console.log(chalk.green('wrote babel config'))
    return true
  } catch (e) {
    console.log(chalk.red(e.message))
    return false
  }
}

const isBabelInstalled = () => checkIfPackageIsInstalled('babel')

const installBabel = () => {
  console.log('going to install babel')
  execSync('npm install --save-dev babel@latest', { stdio: [0, 1, 2] })
}

const isES62015PluginInstalled = () => checkIfPackageIsInstalled('babel-preset-es2015')

const isES62015PluginConfigured = () => {
  const babelConfig = getBabelConfig()

  if (babelConfig.presets.indexOf('es2015') > -1) {
    return true
  }

  return false
}

const installES62015Plugin = () => {
  console.log('going to install the es2015 preset')
  execSync('npm install --save-dev babel-preset-es2015@latest', { stdio: [0, 1, 2] })
}

const configureES62015Plugin = () => {
  console.log('configuring es2015 preset')

  const babelConfig = getBabelConfig()

  babelConfig.presets.push('es2015')

  if (writeBabelConfig(babelConfig)) {
    console.log(chalk.green('configured es2015 preset'))
  }
}

const isStage0PluginInstalled = () => checkIfPackageIsInstalled('babel-preset-stage-0')

const installStage0Plugin = () => {
  console.log('going to install the stage-0 preset')
  execSync('npm install --save-dev babel-preset-stage-0@latest', { stdio: [0, 1, 2] })
}

const isStage0PluginConfigured = () => {
  const babelConfig = getBabelConfig()

  if (babelConfig.presets.indexOf('stage-0') > -1) {
    return true
  }

  return false
}

const configureStage0Plugin = () => {
  console.log('configuring stage-0 preset')

  const babelConfig = getBabelConfig()
  babelConfig.presets.push('stage-0')

  if (writeBabelConfig(babelConfig)) {
    console.log(chalk.green('configured stage-0 preset'))
  }
}

const isReactPluginInstalled = () => checkIfPackageIsInstalled('babel-preset-react')

const installReactPlugin = () => {
  console.log('going to install the babel react preset')
  execSync('npm install --save-dev babel-preset-react@latest', { stdio: [0, 1, 2] })
}

const isReactPluginConfigured = () => {
  const babelConfig = getBabelConfig()

  if (babelConfig.presets.indexOf('react') > -1) {
    return true
  }

  return false
}

const configureReactPlugin = () => {
  console.log('configuring the react preset')

  const babelConfig = getBabelConfig()
  babelConfig.presets.push('react')

  if (writeBabelConfig(babelConfig)) {
    console.log(chalk.green('configured the react preset'))
  }
}

const addBabelSupport = action => {
  if (!(action.type === 'ADD_FILE' || action.type === 'CHANGED_FILE')) {
    return
  }

  let ast
  try {
    ast = parseFile(action.path)
  } catch (e) {
    return
  }

  if (!ast) {
    return
  }

  // detect ES6
  if (!isES62015(ast)) {
    return
  }

  console.log('detected es6')

  if (!isBabelInstalled()) {
    installBabel()
  }

  if (!isES62015PluginInstalled()) {
    installES62015Plugin()
  }

  if (!isES62015PluginConfigured()) {
    configureES62015Plugin()
  }

  if (isStage0(ast)) {
    console.log('detected stage-0 features')

    if (!isStage0PluginInstalled()) {
      installStage0Plugin()
    }

    if (!isStage0PluginConfigured()) {
      configureStage0Plugin()
    }
  }

  if (isReact(ast)) {
    console.log('detected react')

    if (!isReactPluginInstalled()) {
      installReactPlugin()
    }

    if (!isReactPluginConfigured()) {
      configureReactPlugin()
    }
  }
}

function* saga(action) {
  yield addBabelSupport(action)
}

export { saga }
