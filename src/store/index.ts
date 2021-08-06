import { createStore } from 'vuex'
import { mutations } from './mutations'
import state from './state'
import actions from './actions'
import * as getters from './getters'
import plugins from './plugins'
import { State } from './state-types'

export default createStore<State>({
  state,
  actions,
  mutations,
  getters,
  plugins,
})
