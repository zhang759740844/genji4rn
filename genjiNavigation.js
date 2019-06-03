import invariant from 'invariant'

export default class GenjiNavigation {
  /**
   * 初始化 GenjiNavigation
   * @param {Map} navigationMap 所有的路由信息的 Map
   * @param {String} tagName 当前的组件的 tag
   */
  constructor (navigationMap, tagName) {
    this._originalNavigationMap = navigationMap
    this._tagName = tagName
    this._timeout = null
  }

  /**
   * 滞后的设置 navigationMap 和 tagName
   * @param {Map} navigationMap 所有的路由信息的 Map
   * @param {String} tagName 当前的组件的 tag
   */
  setProperty (navigationMap, tagName) {
    this._originalNavigationMap = navigationMap
    this._tagName = tagName
  }

  /**
   * 将 tagName 所在的组件 push 相应页面
   * @param {String} tagName 业务组件的别名
   * @param {String} routerName 路由名
   * @param {Object} param 路由参数
   */
  push (tagName, routerName, param) {
    invariant(this._originalNavigationMap.has(tagName), `zachary 抛出: 未注册的 partTag: ${tagName}`)
    this._originalNavigationMap.get(tagName).push(routerName, param, false)
  }

  /**
   * 将 tagName 所在的组件 push 相应页面，并在其他所有 tagName 的组件展示 Mask
   * @param {String} tagName 业务组件的别名
   * @param {String} routerName 路由名
   * @param {Object} param 路由参数
   */
  pushWithMask (tagName, routerName, param) {
    invariant(this._originalNavigationMap.has(tagName), `zachary 抛出: 未注册的 partTag: ${tagName}`)
    this._originalNavigationMap.get(tagName).push(routerName, param, true)
  }

  /**
   * 当前页面 pop，并隐藏其他所有页面的 Mask
   */
  pop () {
    if (this._timeout) { return }
    // BUGFIX: pop 不能 pop 太快，否则会 pop 到最外层
    this._timeout = setTimeout(() => {
      this._timeout = null
    }, 500)
    this._originalNavigationMap.get(this._tagName).pop()
  }
}
