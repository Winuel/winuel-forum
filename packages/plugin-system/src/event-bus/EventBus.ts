import type { IEventBus, EventHandler } from '../types/index.js'

/**插件事件总线实现*/
export class EventBus implements IEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map()
  private onceHandlers: Map<string, Set<EventHandler>> = new Map()

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler)
    this.onceHandlers.get(event)?.delete(handler)
  }

  once(event: string, handler: EventHandler): void {
    if (!this.onceHandlers.has(event)) {
      this.onceHandlers.set(event, new Set())
    }
    this.onceHandlers.get(event)!.add(handler)
  }

  async emit(event: string, ...args: any[]): Promise<any[]> {
    const handlers = this.handlers.get(event) ?? new Set()
    const onceHandlers = this.onceHandlers.get(event) ?? new Set()
    const allHandlers = [...Array.from(handlers), ...Array.from(onceHandlers)]
    
    this.onceHandlers.delete(event)
    
    const results: any[] = []
    for (const handler of allHandlers) {
      try {
        const result = await handler(...args)
        results.push(result)
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error)
        results.push({ error })
      }
    }
    
    return results
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.handlers.delete(event)
      this.onceHandlers.delete(event)
    } else {
      this.handlers.clear()
      this.onceHandlers.clear()
    }
  }

  listenerCount(event: string): number {
    const handlers = this.handlers.get(event)?.size ?? 0
    const onceHandlers = this.onceHandlers.get(event)?.size ?? 0
    return handlers + onceHandlers
  }
}