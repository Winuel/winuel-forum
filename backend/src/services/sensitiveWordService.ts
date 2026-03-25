import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

interface TrieNode {
  children: Map<string, TrieNode>
  isEnd: boolean
}

export interface SensitiveWordMatch {
  word: string
  startIndex: number
  endIndex: number
}

export class SensitiveWordService {
  private trieRoot: TrieNode
  private sensitiveWords: Set<string>
  private dataDir: string

  constructor(dataDir: string = '/app/data/sensitive-words') {
    this.trieRoot = { children: new Map(), isEnd: false }
    this.sensitiveWords = new Set()
    this.dataDir = dataDir
    this.loadSensitiveWords()
  }

  /**
   * 加载所有敏感词文件
   */
  private loadSensitiveWords(): void {
    try {
      const files = readdirSync(this.dataDir)
      let totalWords = 0

      for (const file of files) {
        if (file.endsWith('.txt')) {
          const filePath = join(this.dataDir, file)
          const content = readFileSync(filePath, 'utf-8')
          const words = content.split('\n').map(w => w.trim()).filter(w => w.length > 0)

          for (const word of words) {
            this.insertWord(word)
            this.sensitiveWords.add(word)
            totalWords++
          }

          console.log(`✓ 加载敏感词文件: ${file} (${words.length} 个词)`)
        }
      }

      console.log(`✓ 敏感词库加载完成，共 ${totalWords} 个敏感词`)
    } catch (error: any) {
      // 如果是目录不存在的错误，在测试环境中可能是正常的，记录警告但不抛出错误
      if (error.code === 'ENOENT') {
        console.warn(`⚠ 敏感词目录不存在: ${this.dataDir}，敏感词过滤功能将被禁用`)
        return
      }
      console.error('✗ 加载敏感词库失败:', error)
      throw error
    }
  }

  /**
   * 将敏感词插入 Trie 树
   */
  private insertWord(word: string): void {
    let node = this.trieRoot

    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, { children: new Map(), isEnd: false })
      }
      node = node.children.get(char)!
    }

    node.isEnd = true
  }

  /**
   * 处理重叠的匹配结果，只保留最长的匹配
   * @param matches 所有匹配结果
   * @returns 过滤后的匹配结果
   */
  private mergeOverlappingMatches(matches: SensitiveWordMatch[]): SensitiveWordMatch[] {
    if (matches.length === 0) {
      return []
    }

    // 按起始位置和结束位置排序
    matches.sort((a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex)

    const result: SensitiveWordMatch[] = []
    let current = matches[0]

    for (let i = 1; i < matches.length; i++) {
      const next = matches[i]

      // 如果下一个匹配与当前匹配重叠
      if (next.startIndex <= current.endIndex) {
        // 保留长度更长的匹配
        if (next.endIndex > current.endIndex) {
          current = next
        }
        // 否则跳过较短的匹配
      } else {
        result.push(current)
        current = next
      }
    }

    result.push(current)
    return result
  }

  /**
   * 检测文本中的敏感词
   * @param text 待检测的文本
   * @returns 匹配到的敏感词列表
   */
  public detect(text: string): SensitiveWordMatch[] {
    const matches: SensitiveWordMatch[] = []
    const textLower = text.toLowerCase()

    for (let i = 0; i < text.length; i++) {
      let node = this.trieRoot
      let startIndex = i
      let endIndex = i

      for (let j = i; j < text.length; j++) {
        const char = text[j].toLowerCase()

        if (node.children.has(char)) {
          node = node.children.get(char)!
          endIndex = j

          if (node.isEnd) {
            const word = text.substring(startIndex, endIndex + 1)
            matches.push({
              word,
              startIndex,
              endIndex
            })
          }
        } else {
          break
        }
      }
    }

    return this.mergeOverlappingMatches(matches)
  }

  /**
   * 检查文本是否包含敏感词
   * @param text 待检测的文本
   * @returns 是否包含敏感词
   */
  public contains(text: string): boolean {
    return this.detect(text).length > 0
  }

  /**
   * 过滤敏感词（替换为 ***）
   * @param text 待过滤的文本
   * @param replacement 替换字符，默认为 '*'
   * @returns 过滤后的文本
   */
  public filter(text: string, replacement: string = '*'): string {
    const matches = this.detect(text)
    if (matches.length === 0) {
      return text
    }

    // 按起始位置排序
    matches.sort((a, b) => a.startIndex - b.startIndex)

    let result = ''
    let lastIndex = 0

    for (const match of matches) {
      // 添加匹配前的文本
      result += text.substring(lastIndex, match.startIndex)

      // 添加替换字符
      result += replacement.repeat(match.word.length)

      lastIndex = match.endIndex + 1
    }

    // 添加剩余文本
    result += text.substring(lastIndex)

    return result
  }

  /**
   * 获取敏感词统计信息
   */
  public getStats() {
    return {
      totalWords: this.sensitiveWords.size,
      categories: this.getCategoryStats()
    }
  }

  /**
   * 获取各分类的敏感词数量
   */
  private getCategoryStats(): Record<string, number> {
    const stats: Record<string, number> = {}

    try {
      const files = readdirSync(this.dataDir)

      for (const file of files) {
        if (file.endsWith('.txt')) {
          const filePath = join(this.dataDir, file)
          const content = readFileSync(filePath, 'utf-8')
          const count = content.split('\n').filter(w => w.trim().length > 0).length
          stats[file.replace('.txt', '')] = count
        }
      }
    } catch (error) {
      console.error('获取分类统计失败:', error)
    }

    return stats
  }

  /**
   * 重新加载敏感词库
   */
  public reload(): void {
    this.trieRoot = { children: new Map(), isEnd: false }
    this.sensitiveWords.clear()
    this.loadSensitiveWords()
  }
}

// 单例模式
let instance: SensitiveWordService | null = null

export function getSensitiveWordService(): SensitiveWordService {
  if (!instance) {
    instance = new SensitiveWordService()
  }
  return instance
}