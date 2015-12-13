/**
 * Imports
 */

import {createStore, applyMiddleware} from 'redux'
import reducer from './reducers'
import effects from 'redux-effects'
import events from 'redux-effects-events'
import location from 'redux-effects-location'
import localstorage from 'redux-effects-localstorage'
import local from 'virtex-local'
import persist from './middleware/persist'
import multi from 'redux-multi'
import logger from 'redux-logger'
import dom from 'virtex-dom'
import component from 'virtex-component'

/**
 * Middleware
 */

const middleware = [
  local('app'),
  component,
  dom(document),
  multi,
  effects,
  localstorage(window.localStorage),
  events(),
  location(),
  persist,
  logger
]

/**
 * Store
 */

function configureStore (initialState) {
  return applyMiddleware(...middleware)(createStore)(reducer, initialState)
}

/**
 * Exports
 */

export default configureStore
