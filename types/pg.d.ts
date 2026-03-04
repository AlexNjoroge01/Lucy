declare module 'pg' {
  export interface PoolConfig {
    connectionString?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
  export class Pool {
    constructor(config: PoolConfig)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query(query: string, values?: unknown[]): Promise<any>
    end(): Promise<void>
  }
}
