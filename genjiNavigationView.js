import React from 'react'
import {View} from 'react-native'
import Constant from 'genji4rn/constant'
export default class TopLevelView extends React.Component {
  componentDidMount () {
    const partTag = this.props.navigation.getParam('partTag')
    this.props.navigation.getParam('registerNavigation')(this.props.navigation, partTag)
    // 显示的时候立即 push 业务页面
    this.props.navigation.push(Constant.businessNavigator, false)
  }

  render () {
    return (
      <View style={{flex: 1}} />
    )
  }
}
