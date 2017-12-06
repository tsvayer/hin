const tls = require('tls')
const { createDomainCertificate } = require('./certificate')
const wildcardDecorator = require('./wildcard-decorator')
const cacheDecorator = require('./cache-decorator')
// const fsDecorator = require('./fs-decorator')
const logDecorator = require('./log-decorator')

const runCertificatePipeline = async (domain, caCert, caKey) =>
    logDecorator(domain, () =>
        wildcardDecorator(domain, () =>
            cacheDecorator(domain, () =>
                //             // fsDecorator(domain, () =>
                createDomainCertificate(domain, caCert, caKey)
            )))

class SniSpoofer {
    constructor(caCert, caKey) {
        this.cert = caCert
        this.key = caKey
    }

    callback() {
        return (domain, cb) => {
            runCertificatePipeline(domain, this.cert, this.key)
                .then(cert => tls.createSecureContext(cert))
                .then(ctx => cb(null, ctx))
        }
    }
}

module.exports = SniSpoofer
