/**
 * 测试一次性邮箱检测功能
 */

import { initEmailChecker, isDisposableEmail } from '../src/utils/validation'
import { BLOCKLIST_DOMAINS, ALLOWLIST_DOMAINS } from '../src/data/blocklist'

// 初始化邮箱检查器
initEmailChecker([...BLOCKLIST_DOMAINS], [...ALLOWLIST_DOMAINS])

// 测试用例
const testCases = [
  // 应该被拦截的一次性邮箱
  { email: 'test@10minutemail.com', expected: true, description: '10分钟邮箱' },
  { email: 'user@guerrillamail.com', expected: true, description: '游击邮箱' },
  { email: 'demo@mailinator.com', expected: true, description: 'Mailinator' },
  { email: 'test@temp-mail.com', expected: true, description: '临时邮箱' },

  // 不应该被拦截的永久邮箱
  { email: 'test@gmail.com', expected: false, description: 'Gmail' },
  { email: 'user@qq.com', expected: false, description: 'QQ邮箱' },
  { email: 'admin@163.com', expected: false, description: '163邮箱' },
  { email: 'test@outlook.com', expected: false, description: 'Outlook' },

  // 边界情况
  { email: 'user@fastmail.com', expected: false, description: 'Fastmail（在允许名单中）' },
  { email: 'test@126.com', expected: false, description: '126邮箱（在允许名单中）' },
  { email: 'user@yahoo.com', expected: false, description: 'Yahoo邮箱' },
  { email: 'test@best-temp-mail.com', expected: true, description: '临时邮箱变体' },
]

console.log('🧪 开始测试一次性邮箱检测功能\n')

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  const result = isDisposableEmail(testCase.email)
  const status = result === testCase.expected ? '✅' : '❌'

  if (result === testCase.expected) {
    passed++
  } else {
    failed++
  }

  console.log(
    `${status} 测试 ${index + 1}: ${testCase.description}`
  )
  console.log(`   邮箱: ${testCase.email}`)
  console.log(`   预期: ${testCase.expected ? '被拦截' : '通过'}`)
  console.log(`   实际: ${result ? '被拦截' : '通过'}`)
  console.log()
})

console.log('📊 测试结果汇总:')
console.log(`   ✅ 通过: ${passed}/${testCases.length}`)
console.log(`   ❌ 失败: ${failed}/${testCases.length}`)

if (failed === 0) {
  console.log('\n🎉 所有测试通过！')
  process.exit(0)
} else {
  console.log('\n⚠️  部分测试失败，请检查实现')
  process.exit(1)
}
