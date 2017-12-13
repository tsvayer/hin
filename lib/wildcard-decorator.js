module.exports = async (domain, target) => {
  const subdomains = domain.split('.')

  if (subdomains.length > 2) {
    domain = subdomains.slice(1).join('.')
    domain = `*.${domain}`
  }

  return target(domain)
}
