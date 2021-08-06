import { isEmptyObject } from '../common/ts/utils'
import { State } from './state-types'

export const isConnected = (state: State): boolean => !isEmptyObject(state.userInfo)
