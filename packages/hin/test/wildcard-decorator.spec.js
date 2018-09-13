const decorator = require('../lib/wildcard-decorator')

describe('Wildcard Decorator', () => {
  it('transforms "a.some.com" to *.some.com', () =>
    decorator('a.some.com', domain => {
      expect(domain).toBe('*.some.com')
    }))

  it('transforms "a.b.some.com to *.b.some.com', () =>
    decorator('a.b.some.com', domain => {
      expect(domain).toBe('*.b.some.com')
    }))

  it('keeps "some.com" unchanged', () =>
    decorator('some.com', domain => {
      expect(domain).toBe('some.com')
    }))
})
