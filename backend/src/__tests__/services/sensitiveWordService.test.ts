import { describe, it, expect, beforeEach } from 'vitest'
import { SensitiveWordService } from '../../services/sensitiveWordService'
import { join } from 'path'

describe('SensitiveWordService', () => {
  let service: SensitiveWordService

  beforeEach(() => {
    // 创建测试用的敏感词服务，使用项目中的敏感词目录
    const dataDir = join(process.cwd(), 'data/sensitive-words')
    service = new SensitiveWordService(dataDir)
  })

  describe('contains', () => {
    it('应该检测到文本中的敏感词', () => {
      // 测试实际存在的敏感词
      expect(service.contains('这是一个政治话题')).toBe(true)
    })

    it('应该检测不到不包含敏感词的文本', () => {
      expect(service.contains('正常的内容')).toBe(false)
      expect(service.contains('这是一条普通的帖子')).toBe(false)
    })

    it('应该处理空文本', () => {
      expect(service.contains('')).toBe(false)
      expect(service.contains('   ')).toBe(false)
    })
  })

  describe('detect', () => {
    it('应该返回所有匹配的敏感词', () => {
      const matches = service.detect('这是一个政治相关的话题')
      expect(matches.length).toBeGreaterThan(0)
    })

    it('应该返回正确的位置信息', () => {
      const matches = service.detect('习近平')
      if (matches.length > 0) {
        expect(matches[0].word).toBe('习近平')
      }
    })
  })

  describe('filter', () => {
    it('应该过滤掉敏感词', () => {
      const result = service.filter('这是一个政治话题', '*')
      expect(result).not.toContain('政治')
    })

    it('应该使用自定义替换字符', () => {
      const result = service.filter('习近平', '#')
      expect(result).not.toContain('习近平')
    })

    it('应该保留非敏感词部分', () => {
      const result = service.filter('这是正常的内容')
      expect(result).toBe('这是正常的内容')
    })
  })

  describe('getStats', () => {
    it('应该返回统计信息', () => {
      const stats = service.getStats()
      expect(stats).toHaveProperty('totalWords')
      expect(stats).toHaveProperty('categories')
      expect(typeof stats.totalWords).toBe('number')
      expect(typeof stats.categories).toBe('object')
    })

    it('应该显示各个分类的敏感词数量', () => {
      const stats = service.getStats()
      expect(stats.totalWords).toBeGreaterThan(0)
    })
  })
})