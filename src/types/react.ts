/**
 * React shim - provides React from the game's API at runtime.
 * This allows JSX to work in mod files.
 *
 * At build time, Vite aliases 'react' and 'react/jsx-runtime' imports to this file.
 * At runtime, we pull React from the game's API.
 */

// Get React from the game's API
const React = window.SubwayBuilderAPI.utils.React;

export default React;
export const {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useReducer,
  useContext,
  createContext,
  createElement,
  Fragment,
} = React;

// JSX runtime for the automatic JSX transform.
//
// The automatic runtime calls jsx(type, props, key) with children inside
// `props.children` and the element key as the THIRD argument. React.createElement
// instead takes children as trailing args and reads `key` off props — so aliasing
// jsx directly to createElement makes the key clobber the children for every
// element rendered in a list. Adapt the signature properly here.
function jsxImpl(type: any, props: any, key?: any) {
  const { children, ...config } = props || {};
  if (key !== undefined) config.key = key;
  return React.createElement(type, config, children);
}

export const jsx = jsxImpl;
export const jsxs = jsxImpl;
export const jsxDEV = jsxImpl;
