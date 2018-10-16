import { YellowBox } from 'react-native'
import invariant from 'invariant'

export default function (ignoreCase) {
  invariant(Array.isArray(ignoreCase), 'ignoreCase should be Array')
  YellowBox.ignoreWarnings(ignoreCase)
}
