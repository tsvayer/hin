const _store = {}
const load = (domain) => _store[domain]
const save = (domain, cert) => _store[domain] = cert

module.exports = async (domain, target) =>
    load(domain)
    || save(domain, await target(domain))
