import {combineReducers,createStore,applyMiddleware} from 'redux'
import {dataReducer} from './reducers'

export const store = createStore( combineReducers({
  dataReducer
}))