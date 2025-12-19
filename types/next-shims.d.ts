// Minimal shims for Next.js modules to satisfy TypeScript in this workspace
declare module 'next/navigation' {
  // Provide minimal types used by this project
  export function useRouter(): any;
  export function useSearchParams(): any;
  export function usePathname(): string;
  export function useParams(): any;
}

declare module 'next/link' {
  import * as React from 'react';
  const Link: React.ComponentType<any>;
  export default Link;
}

declare module 'next/dynamic' {
  const dynamic: any;
  export default dynamic;
}
