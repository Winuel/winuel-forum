/**
 * 测试环境设置
 * Test Environment Setup
 * 
 * 初始化测试所需的全局变量和模拟对象
 * Initializes global variables and mock objects required for testing
 */

// 设置测试环境变量
;(globalThis as any).ENVIRONMENT = 'test'
;(globalThis as any).NODE_ENV = 'test'

// 清理任何可能在测试间遗留的全局状态
afterEach(() => {
  // 可以在这里添加清理逻辑
  // 例如重置全局变量、清除定时器等
})