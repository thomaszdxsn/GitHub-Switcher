/**
 * Type declarations for Plasmo-specific imports
 */

// Data URL imports (base64-encoded assets)
declare module 'data-base64:~assets/*' {
  const content: string;
  export default content;
}

// Data URL imports (base64-encoded files)
declare module 'data-base64:*' {
  const content: string;
  export default content;
}
