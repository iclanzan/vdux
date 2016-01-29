/**
 * Imports
 */

import applyMiddleware from 'redux/lib/applyMiddleware'
import createStore from 'redux/lib/createStore'
import dom, {reconstitute} from 'virtex-dom'
import local, {mount} from 'virtex-local'
import component from 'virtex-component'
import empty from '@f/empty-element'
import delegant from 'delegant'
import virtex from 'virtex'

/**
 * vdux
 */

function vdux ({middleware = [], reducer, initialState = {}, app, node = document.body, vtree}) {
  /**
   * Create redux store
   */

  const dirty = {}
  const components = {}
  const store = applyMiddleware(dom, local('ui', dirty), component(components), ...middleware)(createStore)(mount('ui', reducer), initialState)

  /**
   * Initialize virtex
   */

  const {create, update, updatePaths} = virtex(store.dispatch)

  /**
   * Empty the root node
   */

  if (!vtree) {
    empty(node)
  }

  /**
   * Render the VDOM tree
   */

  if (vtree) {
    reconstitute(vtree, node.firstChild)
    syncNow()
  } else {
    vtree = render()
    node.appendChild(create(vtree).element)
  }

  /**
   * Create the Virtual DOM <-> Redux cycle
   */

  const unsubscribe = store.subscribe(sync)
  const undelegate = delegant(node, action => action && store.dispatch(action))

  return {
    replace (_app, _reducer) {
      app = _app
      reducer = _reducer
      store.replaceReducer(mount('ui', reducer))
      sync()
    },

    stop () {
      unsubscribe()
      undelegate()
    }
  }

  /**
   * Render a new virtual dom
   */

  function render () {
    return app(store.getState())
  }

  /**
   * Sync the virtual dom and the actual dom
   */

  let pending = false

  function sync () {
    // Prevent re-entrant renders
    if (pending) return
    pending = true

    setTimeout(syncNow)
  }

  function syncNow () {
    pending = false

    const newTree = render()

    update(vtree, newTree)
    updateDirty()

    vtree = newTree
  }

  function updateDirty () {
    Object
      .keys(dirty)
      // Sort by shortest dirty paths first, so that if possible
      // we get some of the higher re-renders cleaning up some
      // of the lower ones
      .sort((a, b) => a.length - b.length)
      .forEach(path => {
        // Check that it's still dirty, since the re-rendering of a higher component
        // may cause one of the lower ones to get re-rendered
        if (dirty[path]) {
          const component = components[path]
          const prev = {...component}
          component.vnode = null
          update(prev, component, path)
        }
      })
  }
}

/**
 * Exports
 */

export default vdux
