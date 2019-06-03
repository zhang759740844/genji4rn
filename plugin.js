import invariant from 'invariant'

class Plugin {
  constructor () {
    this.hooks = []
  }

  use (plugin) {
    invariant(Array.isArray(plugin), 'zachary 抛出: plugin 必须是数组类型')
    this.hooks.push(...plugin)
  }

  get () {
    return this.hooks
  }
}

export default Plugin
