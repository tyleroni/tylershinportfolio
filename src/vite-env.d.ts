/// <reference types="vite/client" />

/**
 * CSS Modules type declarations.
 *
 * Without this, TypeScript would complain that `.module.scss` imports
 * have no type information. This says: any .module.scss import returns
 * an object whose keys are strings and whose values are also strings
 * (the generated unique class names).
 */
declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
