const store = {}
const load = domain => store[domain]
const save = (domain, cert) => (store[domain] = cert)

module.exports = async (domain, target) =>
  load(domain) || save(domain, await target(domain))
