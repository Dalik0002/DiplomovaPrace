// A very small React-like library implementing useState and useEffect.
// This file assigns React and ReactDOM to the global scope so that
// components can be written using the familiar React API. While it
// doesn't include every feature of React, it supports the hooks and
// rendering needed for this project.  See tiny-react.js for the
// original source.

const React = (() => {
  let hooks = [];
  let effects = [];
  let hookIndex = 0;
  let effectIndex = 0;
  let rootComponent = null;
  let rootContainer = null;

  function createElement(type, props, ...children) {
    return { type, props: props || {}, children: children.flat() };
  }

  function render(vnode, container) {
    rootComponent = vnode.type;
    rootContainer = container;
    update();
  }

  function update() {
    hookIndex = 0;
    effectIndex = 0;
    // Invoke the root component to get a fresh vnode tree
    const vnode = rootComponent();
    // Clear the container
    rootContainer.innerHTML = '';
    // Render the vnode tree
    rootContainer.appendChild(_render(vnode));
    // After rendering, run effects if dependencies changed
    effects.forEach(effect => {
      const [fn, deps, prevDeps] = effect;
      let changed = true;
      if (deps) {
        // Compare deps arrays
        if (prevDeps) {
          changed = deps.some((dep, i) => dep !== prevDeps[i]);
        }
      }
      if (changed) {
        fn();
        effect[2] = deps;
      }
    });
  }

  function useState(initialValue) {
    const currentIndex = hookIndex;
    hooks[currentIndex] = hooks[currentIndex] === undefined ? initialValue : hooks[currentIndex];
    function setState(newValue) {
      hooks[currentIndex] = newValue;
      // Trigger re-render
      update();
    }
    hookIndex++;
    return [hooks[currentIndex], setState];
  }

  function useEffect(fn, deps) {
    effects[effectIndex] = effects[effectIndex] || [fn, deps, undefined];
    effects[effectIndex][0] = fn;
    effects[effectIndex][1] = deps;
    effectIndex++;
  }

  function _render(vnode) {
    // Strings and numbers become text nodes
    if (typeof vnode === 'string' || typeof vnode === 'number') {
      return document.createTextNode(String(vnode));
    }
    // Functional component
    if (typeof vnode.type === 'function') {
      return _render(vnode.type({ ...vnode.props, children: vnode.children }));
    }
    // Standard DOM element
    const el = document.createElement(vnode.type);
    // Apply props
    for (const [key, value] of Object.entries(vnode.props || {})) {
      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, value);
      } else if (key === 'className') {
        el.setAttribute('class', value);
      } else if (value !== false && value != null) {
        el.setAttribute(key, value);
      }
    }
    // Render children
    (vnode.children || []).forEach(child => {
      el.appendChild(_render(child));
    });
    return el;
  }

  return {
    createElement,
    useState,
    useEffect,
    render
  };
})();

const ReactDOM = {
  render: (vnode, container) => React.render(vnode, container)
};
