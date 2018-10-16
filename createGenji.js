import React, { Component } from 'react'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { handleActions } from 'redux-actions'
import Plugin from './plugin'
import GlobalContext from './global'
import { setTopLevelNavigator } from './router'

class Genji {
  constructor () {
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
    if (module.publicHandlers && Array.isArray(module.publicHandlers)) {
      module.publicHandlers.map((item) => {
        GlobalContext.registerHandler(namespace.replace(/\//g, '.') + '.' + item.name, item.action)
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

    const appReducer = combineReducers({
      ...mergeReducers
    })
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
    console.log(this._store)
    return this._store
  }

  /**
   * start the whole hanzo instance
   * return React.Component
   */
  start (TopLevelNavigator) {
    let store = this.getStore()
    return class extends Component {
      render () {
        return (
          <Provider store={store}>
            <TopLevelNavigator
              ref={navigationRef => { setTopLevelNavigator(navigationRef) }}
            />
          </Provider>
        )
      }
    }
  }
}

function createGenji () {
  return new Genji()
}

export default createGenji
