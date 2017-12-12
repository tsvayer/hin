#!/usr/bin/env node

const program = require('commander')
const fs = require('fs')
const path = require('path')
const pkg = require('../package.json')
const Proxy = require('../lib/proxy')
const { createRootCA } = require('../lib/certificate')

const USER_HOME = process.env.USERPROFILE || process.env.HOME
const APP_HOME = process.env.HIN_HOME || path.join(USER_HOME, '/.hin/')

program
  .version(pkg.version)
  .name(pkg.name)
  .usage('-c <root_ca_file> -k <private_key_file>')
  .option('-c, --cert <path>', 'Path to Root CA file in PEM format')
  .option('-k, --key <path>', 'Path to Private Key file in PEM format')
  .option('-p, --port <value>', 'Proxy port', 8001)
  .option('-g, --generate', 'Generate Private Key and Root CA')
  .parse(process.argv)

if (!fs.existsSync(APP_HOME)) fs.mkdirSync(APP_HOME)

let caCertPath = path.join(APP_HOME, '_ca.crt')
let caKeyPath = path.join(APP_HOME, '_ca.pem')

if (program.cert) caCertPath = program.cert

if (program.key) caKeyPath = program.key

let shouldGenerate = false

if (!fs.existsSync(caKeyPath) && !fs.existsSync(caCertPath)) {
  shouldGenerate = true
}

// TODO: add confirmation for overwrite
if (program.generate || shouldGenerate) {
  console.log('Generating new Private Key and Root CA...')
  const { key, cert } = createRootCA('HIN - Http Interceptor')

  fs.writeFileSync(caCertPath, cert, 'ascii')
  fs.writeFileSync(caKeyPath, key, 'ascii')
  console.log(`New Private Key is written to ${caKeyPath}`)
  console.log(`New Root CA certificate is written to ${caCertPath}`)
  console.log(
    'Please note that you need to add Root CA to Trusted Certificates'
  )
}

const caCert = fs.readFileSync(caCertPath, 'ascii')
const caKey = fs.readFileSync(caKeyPath, 'ascii')

if (caCert && caKey) {
  ;(async () => {
    const options = {
      proxyPort: program.port,
      interceptorPort: program.port + 1,
      caKey,
      caCert
    }

    await new Proxy(options).start()

    console.log(`Proxy started on ${program.port}`)

    // TODO: better exception management
    process.on('uncaughtException', () => {
      // console.error(err)
    })
  })()
}
