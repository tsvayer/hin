const sha256 = require('node-forge').md.sha256
const pki = require('node-forge').pki
const rsa = require('node-forge').pki.rsa
const { isIPv4 } = require('net')

//TODO: take as option
const defaultAttrs = [
    { name: 'countryName', value: 'TR' },
    { shortName: 'ST', value: 'Antalya' }, //State/Province
    { name: 'organizationName', value: 'HIN - Http Interceptor' },
    { shortName: 'OU', value: 'IT' } //Organization Unit
]

function addYears(date, years) {
    const newDate = new Date(date.getTime())
    newDate.setFullYear(date.getFullYear() + years)
    return newDate
}

function parseKeyPair(pem) {
    const privateKey = pki.privateKeyFromPem(pem)
    const publicKey = rsa.setPublicKey(privateKey.n, privateKey.e)
    return { privateKey, publicKey }
}

const convertToPem = cert => ({
    key: pki.privateKeyToPem(cert.keyPair.privateKey),
    cert: pki.certificateToPem(cert.cert)
})

const getKeyPair = key => key
    ? parseKeyPair(key)
    : rsa.generateKeyPair(2046)

// Subject Alt Name Types
// #define GEN_OTHERNAME   0
// #define GEN_EMAIL       1
// #define GEN_DNS         2 (domain names)
// #define GEN_X400        3
// #define GEN_DIRNAME     4
// #define GEN_EDIPARTY    5
// #define GEN_URI         6
// #define GEN_IPADD       7 (ip addresses)
// #define GEN_RID         8
const buildSANExtension = domain => isIPv4(domain)
    ? {
        name: 'subjectAltName',
        altNames: [{ type: 7, ip: domain }]
    } : {
        name: 'subjectAltName',
        altNames: [{ type: 2, value: domain }]
    }

const generateSerialNumber = () => new Date().getTime().toString()

function createCertificate(domain, extensions = []) {
    const cert = pki.createCertificate()
    cert.serialNumber = generateSerialNumber()
    cert.validity.notBefore = new Date()
    cert.validity.notAfter = addYears(new Date(), 1)
    cert.setSubject(defaultAttrs.concat([
        { name: 'commonName', value: domain }
    ]))
    cert.setExtensions(extensions)
    return cert
}

function signCertificate(cert, key) {
    const keyPair = getKeyPair(key)
    cert.publicKey = keyPair.publicKey
    cert.sign(keyPair.privateKey, sha256.create())
    return { keyPair, cert }
}

function createRootCA(domain) {
    const extensions = [
        { name: 'basicConstraints', cA: true }
    ]
    const cert = createCertificate(domain, extensions)
    cert.setIssuer(cert.subject.attributes)

    return convertToPem(signCertificate(cert))
}

function createDomainCertificate(domain, caCertPem, caKeyPem) {
    const extensions = [
        { name: 'basicConstraints', cA: false },
        buildSANExtension(domain)
    ]
    const cert = createCertificate(domain, extensions)
    const caCert = pki.certificateFromPem(caCertPem)
    cert.setIssuer(caCert.subject.attributes)

    return convertToPem(signCertificate(cert, caKeyPem))
}

module.exports.createRootCA = createRootCA
module.exports.createDomainCertificate = createDomainCertificate
