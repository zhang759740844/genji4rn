import {createStackNavigator as rnstackNavigator, createSwitchNavigator as rnswitchNavigator, withNavigation as rnwithNavigation} from 'react-navigation'
export function createStackNavigator (...param) {
  return rnstackNavigator(...param)
}

export function createSwitchNavigator (...param) {
  return rnswitchNavigator(...param)
}

export function withNavigation (...param) {
  return rnwithNavigation(...param)
}
