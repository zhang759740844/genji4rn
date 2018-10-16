import invariant from 'invariant'

class Plugin {
  constructor () {
    this.hooks = []
  }

  use (plugin) {
    invariant(Array.isArray(plugin), 'plugin.use: plugin should be Array')
    this.hooks.push(...plugin)
  }

  get () {
    return this.hooks
  }
}

export default Plugin
