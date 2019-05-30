import { connect } from 'react-redux'
import { createAction } from 'redux-actions'
import { bindActionCreators } from 'redux'
import GlobalContext from './global'
import { withNavigation } from 'react-navigation'

/**
 * 封装了 react-redux 提供的 connect 方法，简化了 mapDispatchToProps 的操作
 * 可以没有 model, 没有 model 相当于
 *
 * @export
 * @param {function} mapStateToProps 同 react-redux 的 mapStateToProps
 * @param {Object} model reducer 和 state 的集合
 * @returns 经过 connect 的高阶组件
 */
export default function (mapStateToProps, model) {
  const actionCreators = {}
  let _handlers = []
  if (model) {
    //  model 中的 handlers 和 publicHandlers 都要注册
    if (model.handlers && Array.isArray(model.handlers)) {
      _handlers = _handlers.concat(model.handlers)
    }
    if (model.publicHandlers && Array.isArray(model.publicHandlers)) {
      _handlers = _handlers.concat(model.publicHandlers)
    }
  }
  if (_handlers.length > 0) {
    _handlers.map((key) => {
      if (key.action) {
        // 有异步 action 的 handler 注册
        if (key.validate) {
          actionCreators[key.name] = createAction(model.namespace + '/' + key.name, key.action, key.validate)
        } else {
          actionCreators[key.name] = createAction(model.namespace + '/' + key.name, key.action)
        }
      } else if (key.handler) {
        // 有 handler 的要到 global 中获取相应 handler
        let globalHandler = GlobalContext.getHandler(key.handler)
        if (globalHandler) {
          if (key.validate) {
            actionCreators[key.name] = createAction(key.handler, globalHandler, key.validate)
          } else {
            actionCreators[key.name] = createAction(key.handler, globalHandler)
          }
        }
      } else {
        // 最普通的 handler
        actionCreators[key] = createAction(model.namespace + '/' + key)
      }
    })
    const mapDispatchToProps = (dispatch) => bindActionCreators(actionCreators, dispatch)
    let connectedMap = connect(mapStateToProps, mapDispatchToProps)
    return function (component, withNavi = true) {
      if (withNavi) {
        return withNavigation(connectedMap(component))
      } else {
        return connectedMap(component)
      }
    }
  } else {
    let connectedMap = connect(mapStateToProps)
    return function (component, withNavi = true) {
      if (withNavi) {
        return withNavigation(connectedMap(component))
      } else {
        return connectedMap(component)
      }
    }
  }
}
