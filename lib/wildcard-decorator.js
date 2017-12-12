module.exports = async (domain, target) => {
  let subdomains = domain.split('.')

  if (subdomains.length > 2) {
    subdomains = subdomains.slice(1)
    domain = subdomains.join('.')
    domain = `*.${domain}`
  }

  return target(domain)
}
