import React from 'react'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { handleActions } from 'redux-actions'
import Plugin from './plugin'
import GlobalContext from './global'
import {createStackNavigator, createSwitchNavigator} from 'react-navigation'
import invariant from 'invariant'
import GenjiNavigation from './genjiNavigation'
import Constant from './constant'
import GenjiNavigationView from './genjiNavigationView'
import GenjiRootView from 'genji4rn/genjiRootView'

class Genji {
  constructor (tagName) {
    // genji 实例的 tag
    this._tag = tagName
    // genji 的各屏的 genjiNavigation 的字典
    this._navigationMap = new Map()
    // 传入业务组件的字典
    this._genjiNavigationMap = new Map()
    // genji 设置各屏的 mask 情况
    this._modalState = new Map()
    this._reducers = {}
    this._store = null
    this._plugin = new Plugin()
  }

  /**
   * 注册中间件插件
   * 必须在 start 前注册中间件
   *
   * @param {Array} plugin 插件数组
   * @memberof Genji
   */
  use (plugin) {
    this._plugin.use(plugin)
  }

  /**
   * private method
   * merge reducers by hierachy
   * user/login, user/info -> user:{ login, info }
  */
  _mergeReducers (obj, arr, res) {
    if (arr.length > 1) {
      let hierachy = arr.splice(0, 1)[0]
      obj[hierachy] = obj[hierachy] || {}
      this._mergeReducers(obj[hierachy], arr, res)
    } else {
      obj[arr[0]] = res || {}
    }
  }

  /**
   * 注册模块
   * @param {Object} module 模块
   */
  registerModule (module) {
    let Actions = {}
    let namespace = module.models.namespace.replace(/\/$/g, '') // events should be have the namespace prefix
    Object.keys(module.models.reducers).map((key) => {
      // 加 '/' 的表示全局的 reducer,不会添加 namespace,这样可以修改其他模块下的 state
      if (key.startsWith('/')) {
        Actions[key.substr(1)] = module.models.reducers[key]
      } else {
        Actions[namespace + '/' + key] = module.models.reducers[key]
      }
    })
    // 这里将 initialState 传给 reducer
    let _temp = handleActions(Actions, module.models.state)
    let _arr = namespace.split('/')
    // 将 reducer 放置到 _reducers 下对应 namespace 的相应部分
    this._mergeReducers(this._reducers, _arr, _temp)

    // 注册全局的 handler
    if (module.models.publicHandlers && Array.isArray(module.models.publicHandlers)) {
      module.models.publicHandlers.map((item) => {
        GlobalContext.registerHandler(namespace.replace(/\//g, '/') + '/' + item.name, item.action)
      })
    }
  }

  /**
   * create the reducers
   */
  getReducer () {
    const mergeReducers = this._reducers
    for (let k in mergeReducers) {
      if (typeof mergeReducers[k] === 'object') {
        mergeReducers[k] = combineReducers(mergeReducers[k])
      }
    }

    const appReducer = combineReducers({ ...mergeReducers })
    return appReducer
  }

  /**
   * create the redux-store
   */
  getStore () {
    if (this._store) {
      return this._store
    }
    let middlewares = this._plugin.get()
    this._store = createStore(this.getReducer(), composeWithDevTools(
      applyMiddleware(...middlewares)
    ))
    return this._store
  }

  /**
   * 最基础的获取 store 的方法
   * return React.Component
   */
  start (BusinessNavigator) {
    const store = this.getStore()
    const NewTopLevelNavigator = createSwitchNavigator({
      [Constant.businessNavigator]: BusinessNavigator
    }, {
      initialRouteName: Constant.businessNavigator,
      navigationOptions: {header: null}
    })
    return (
      <Provider store={store}>
        <NewTopLevelNavigator />
      </Provider>
    )
  }

  /**
   * 将业务组件的 navigation 保存到 genji 中
   * @param {Object} navigation 业务组件的 navigation
   * @param {String} partTag 业务组件的名称
   */
  _saveNavigation (navigation, partTag) {
    let originPush = navigation.push
    let originPop = navigation.pop
    const genji = this
    navigation.pop = function () {
      originPop()
      genji._modalState.forEach(value => {
        value(false)
      })
    }
    navigation.push = function (routerName, params, mask = false) {
      originPush(routerName, params)
      if (!mask) { return }
      genji._modalState.forEach((value, key, maps) => {
        if (key === partTag) {
          value(false)
        } else {
          value(true)
        }
      })
    }
    let emptyNavigation = this._navigationMap.get(partTag)
    this._navigationMap.set(partTag, Object.assign(emptyNavigation, navigation))
    let emptyGenjiNavigation = this._genjiNavigationMap.get(partTag)
    emptyGenjiNavigation.setProperty(this._navigationMap, partTag)

    this._genjiNavigationMap.set(partTag, emptyGenjiNavigation)
  }

  /**
   * 创建带有 router 和 store 的组件
   * @param {React.Component} BusinessNavigator 由 react-navigation 创建的 Component
   * @param {String} partTag 当前业务组件的标识
   */
  startWithTag (BusinessNavigator, partTag = 'default') {
    invariant(!this._navigationMap.has(partTag), 'zachary 抛出: 请勿重复注册 partTag 相同的组件')

    const NewTopLevelNavigator = createStackNavigator({
      [Constant.genjiRootNavigationView]: GenjiNavigationView,
      [Constant.businessNavigator]: BusinessNavigator
    }, {
      initialRouteParams: {
        registerNavigation: (navigation, partTag) => this._saveNavigation(navigation, partTag),
        partTag
      },
      initialRouteName: Constant.genjiRootNavigationView,
      navigationOptions: {header: null}
    })
    const genji = this
    // BugFix: 要预初始化一个 genjiNavigation 对象
    genji._genjiNavigationMap.set(partTag, new GenjiNavigation())
    genji._navigationMap.set(partTag, {})
    return (props) => {
      return (
        <GenjiRootView {...props} genji={genji} partTag={partTag}>
          <NewTopLevelNavigator />
        </GenjiRootView>
      )
    }
  }
}

function createGenji (tag = 'default') {
  return new Genji(tag)
}

export default createGenji
