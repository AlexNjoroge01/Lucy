declare module '@radix-ui/react-popover' {
  // Minimal typings to satisfy TypeScript without enforcing Radix internals
  import * as React from 'react'
  export const Root: React.FC<any>
  export const Trigger: React.FC<any>
  export const Portal: React.FC<any>
  export const Content: React.ForwardRefExoticComponent<any>
}
