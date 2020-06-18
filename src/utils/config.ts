export function config(envName: string): string {
    return process.env[envName] || ''
  }
  