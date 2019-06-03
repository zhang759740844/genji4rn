import React, { Component } from 'react'
import {View} from 'react-native'
import { Provider } from 'react-redux'
import {Modal, Provider as AntProvider} from '@ant-design/react-native'
export const GenjiContext = React.createContext({})
export default class GenjiRootView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false
    }

    this.props.genji._modalState.set(this.props.partTag, (visible) => {
      this.setState({ visible })
    })
  }

  render () {
    // 子组件显示滞后，所以注册后移了，现在就是 undefined
    const genjiNavigation = this.props.genji._genjiNavigationMap.get(this.props.partTag)
    const store = this.props.genji.getStore()
    return (
      <Provider store={store}>
        <AntProvider>
          <GenjiContext.Provider value={genjiNavigation}>
            {this.props.children}
          </GenjiContext.Provider>
          <Modal
            closable
            maskClosable
            animateAppear='fade'
            transparent={false}
            visible={this.state.visible}
          >
            <View style={{flex: 1, backgroundColor: 'red'}} />
          </Modal>
        </AntProvider>

      </Provider>
    )
  }
}