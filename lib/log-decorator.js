// TODO: example simplistic log decorator
const log = domain => console.log(`SSL Certificate for: ${domain}`)

module.exports = async (domain, target) => log(domain) || target(domain)
