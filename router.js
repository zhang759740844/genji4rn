import { NavigationActions } from 'react-navigation'
var _navigator
/**
 * 设置全局可访问的 Navigation
 *
 * @export
 * @param {*} navigatorRef
 */
export function setTopLevelNavigator (navigatorRef) {
  _navigator = navigatorRef
}

/**
 * 全局可获得的导航方法
 *
 * @param {String} routeName 要导航到的 router 的名字
 * @param {Object} params 参数
 */
export function globalNavigate (routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params
    })
  )
}
