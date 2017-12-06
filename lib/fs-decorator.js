const doAsync = require('doasync')
const fs = doAsync(require('fs'))
const strFormat = require('util').format

//TODO: get as option
const config = {
    crtPath: './.proxy/certs/%s.crt',
    keyPath: './.proxy/certs/%s.pem',
}

const readDomainKey = async (domain) =>
    await fs.readFile(strFormat(config.keyPath, domain), 'ascii')

const readDomainCert = async (domain) =>
    await fs.readFile(strFormat(config.crtPath, domain), 'ascii')

const writeDomainKey = async (domain, pem) =>
    await fs.writeFile(strFormat(config.keyPath, domain), pem)

const writeDomainCert = async (domain, pem) =>
    await fs.writeFile(strFormat(config.crtPath, domain), pem)

const exists = async (domain) =>
    await fs.exists(strFormat(config.crtPath, domain))

const save = async (domain, cert) => {
    await writeDomainKey(domain, cert.key)
    await writeDomainCert(domain, cert.cert)
    return cert
}

const load = async (domain) => {
    if (!(await exists(domain))) return ''
    const key = await readDomainKey(domain)
    const cert = await readDomainCert(domain)
    return { key, cert }
}

module.exports = async (domain, target) =>
    await load(domain)
    || save(domain, await target(domain))