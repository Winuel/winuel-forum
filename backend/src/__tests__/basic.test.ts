import { describe, it, expect } from 'vitest'

describe('Basic Test', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should access globalThis', () => {
    expect((globalThis as any).ENVIRONMENT).toBe('test')
  })
})