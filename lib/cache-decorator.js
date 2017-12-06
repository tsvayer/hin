const _store = {}
const load = async (domain) => _store[domain]
const save = async (domain, cert) => _store[domain] = cert

module.exports = async (domain, target) =>
    await load(domain)
    || save(domain, await target(domain))