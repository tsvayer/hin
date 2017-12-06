#!/usr/bin/env node

const program = require('commander')
const fs = require('fs')
const package = require('../package.json')

program
    .version(package.version)
    .name(package.name)
    .usage('-c <root_ca_file> -k <private_key_file>')
    .option('-c, --cert <path>', 'Path to Root CA file in PEM format')
    .option('-k, --key <path>', 'Path to Private Key file in PEM format')
    .option('-p, --port <value>', 'Proxy port', 8001)
    .option('-g, --gen', 'Generate Private Key and Root CA')
    .parse(process.argv)

let caKey, caCert

if (program.gen) {
    const { createRootCA } = require('../lib/certificate')
    const { key, cert } = createRootCA("HIN - Http Interceptor")
    caKey = key
    caCert = cert
    fs.writeFileSync('.hin/_ca.crt', cert, 'ascii')
    fs.writeFileSync('.hin/_ca.pem', key, 'ascii')
    console.log(key)
    console.log(cert)
} else if (program.cert && program.key) {
    caCert = fs.readFileSync(program.cert, 'ascii')
    caKey = fs.readFileSync(program.key, 'ascii')
}

if (caCert && caKey) {
    const Proxy = require('../lib/proxy')
    ;(async () => {
        const options = {
            proxyPort: program.port,
            interceptorPort: program.port + 1,
            caKey,
            caCert
        }
        await new Proxy(options).start()

        //TODO: better exception management
        process.on('uncaughtException', (err) => {
            // console.error(err)
        })
    })()
}
