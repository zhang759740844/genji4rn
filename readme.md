## 状态管理
### 示例
```js
// App.js
import { createGenji } from 'genji4rn'

const genji = createGenji()
genji.registerModule(require('./page/login'))
genji.registerModule(require('./page/IM'))
genji.use([
  promiseMiddleware({
    promiseTypeSuffixes: ['Loading', 'Success', 'Error']
  })
])
export default genji.start(TopLevelNavigator)
```
### registerModule
`registerModule()` 方法接收一个模块对象作为参数:
```js
import {connect} from 'genji4rn'
import model from './model'

module.exports = {
  models: model,
  views: {
    Login: connect(null, model)(require('./views/login')),
    Launch: connect(null, model)(require('./views/launch')),
  }
}
```
模块对象包含两个字段 `models` 和 `views`，分别为逻辑部分和视图部分。

视图部分封装了 react-redux 提供的 `connect()` 方法，第一个参数还是传入 `mapStateToProps`，第二个参数变为 `model`，`mapDispatchToProps` 中的参数将在 `model` 中获取。

`model` 把 redux 中分割的各个部分都集合了起来：

```js
module.exports = {
  namespace: 'login',
  state: {
  },
  handlers: [
    {name: 'checkToken', action: checkToken},
    {name: 'login', action: login},
    {name: 'checkWxLoginAuth', handler: checkWxLoginAuth}
  ],
  reducers: {
  },
  publicHandlers: []
}
```

可以看到有这些属性：

1. namespace: 模块名，注册到 store 中的键
2. state: 注册到 store 中的值
3. handlers: `mapDispatchToProps` 的提供者，`name` 为方法名，`action` 为具体的方法。
4. reducers: redux 中改变 store 状态的方法。另外如果 reduces 的键以 `/` 开头，则可以监听非本模块的 action。
5. publicHandlers: 全局的 handlers，任意模块都能使用这个方法。比如上面 `{name: 'checkWxLoginAuth', handler: checkWxLoginAuth}` 就是调用 publicHandlers 中的方法。

> 补充，全局 reducer 和 publicHandler 是非常有用的两个功能。它们分别对应着两种常用的场景。
>
> publicHandlers 的适用场景是，其他人的变动要通知我做出相应变动的情况。即多对一。
>
> 全局 reducer 的适用场景是，我的变动要通知其他人的变动的情况。即一对多。

### use
注册中间件

### start
`start()` 方法接收视图组件，给视图组件提供全局 store。



## 全局router

配合 react-navigation 可以获得全局的跳转页面方法 `globalNavigate()`。

### 使用
`globalNavigate()` 方法接受两个参数。第一个参数为跳转页面注册的路由名称，第二个参数为要传递的参数。

### 示例
```js
import { globalNavigate } from 'genji4rn'

globalNavigate('xxxRouterName', {
  param: 'someParam'
})
```

## 隐藏 Warning
一些外部组件引入的 Warning 需要隐藏可以使用。

### 使用
`ignoreYellowBoxArr()` 方法接收一个字符串数组，字符串包含 Warning 信息即可。

###  示例
```js
import { ignoreYellowBoxArr } from 'genji4rn'

const ignoreCase = [
  // ant design 引入的
  'Warning: NativeButton: prop type `background` is invalid;',
  'Required dispatch_sync to load constants for RNDeviceInfo.'
]
ingoreYellowBoxArr(ignoreCase)
```