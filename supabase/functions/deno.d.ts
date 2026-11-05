// Type declarations for Deno runtime in Supabase Edge Functions

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }

  export const env: Env;

  export interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: ServeOptions
  ): void;

  export function serve(
    options: ServeOptions,
    handler: (request: Request) => Response | Promise<Response>
  ): void;
}

declare module 'https://*' {
  const content: any;
  export default content;
  export const serve: (
    handler: (req: Request) => Response | Promise<Response>,
    options?: any
  ) => void;
  export const createClient: any;
}

declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: { port?: number; hostname?: string; onListen?: () => void }
  ): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@*' {
  export const createClient: any;
  export type SupabaseClient = any;
}

