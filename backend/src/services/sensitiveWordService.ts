/**
 * 敏感词检测服务
 * Sensitive Word Detection Service
 * 
 * 负责文本内容的敏感词检测和过滤，包括：
 * - 敏感词库加载（支持文件系统和内置词库）
 * - 使用 Trie 树结构进行高效的敏感词匹配
 * - 敏感词检测、过滤和替换
 * - 支持重叠匹配的处理
 * - 提供统计信息和重新加载功能
 * 
 * Provides sensitive word detection and filtering for text content, including:
 * - Sensitive word library loading (supports file system and built-in library)
 * - Efficient sensitive word matching using Trie tree structure
 * - Sensitive word detection, filtering, and replacement
 * - Handles overlapping matches
 * - Provides statistics and reload functionality
 * 
 * @package backend/src/services
 */

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

/**
 * Trie 树节点接口
 * Trie Tree Node Interface
 * 定义 Trie 树节点的数据结构
 * Defines the data structure of Trie tree nodes
 */
interface TrieNode {
  /** 子节点映射 / Child node mapping */
  children: Map<string, TrieNode>
  /** 是否为单词结尾 / Whether it's the end of a word */
  isEnd: boolean
}

/**
 * 敏感词匹配结果接口
 * Sensitive Word Match Result Interface
 * 定义敏感词匹配结果的数据结构
 * Defines the data structure of sensitive word match results
 */
export interface SensitiveWordMatch {
  /** 匹配到的敏感词 / Matched sensitive word */
  word: string
  /** 开始索引 / Start index */
  startIndex: number
  /** 结束索引 / End index */
  endIndex: number
}

/**
 * 敏感词检测服务类
 * Sensitive Word Detection Service Class
 * 
 * 提供敏感词检测的所有业务逻辑
 * Provides all business logic for sensitive word detection
 */
export class SensitiveWordService {
  /** Trie 树根节点 / Trie tree root node */
  private trieRoot: TrieNode
  /** 敏感词集合 / Sensitive word set */
  private sensitiveWords: Set<string>
  /** 敏感词数据目录 / Sensitive word data directory */
  private dataDir: string

  /**
   * 构造函数
   * Constructor
   * 
   * @param dataDir - 敏感词数据目录路径 / Path to sensitive word data directory
   */
  constructor(dataDir: string = '/app/data/sensitive-words') {
    this.trieRoot = { children: new Map(), isEnd: false }
    this.sensitiveWords = new Set()
    this.dataDir = dataDir
    this.loadSensitiveWords()
  }

  /**
   * 加载所有敏感词文件（私有方法）
   * Load All Sensitive Word Files (Private Method)
   * 
   * 从文件系统或加载内置敏感词库
   * Loads sensitive word library from file system or built-in library
   */
  private loadSensitiveWords(): void {
    try {
      // 尝试从文件系统加载（本地开发环境） / Try to load from file system (local development environment)
      // 使用typeof检查避免window类型错误 / Use typeof check to avoid window type errors
      const isBrowser = typeof (globalThis as any).window !== 'undefined'
      const isNode = typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.versions
      
      if (!isBrowser && isNode) {
        const { readdirSync, readFileSync } = require('fs')
        const { join } = require('path')
        const files = readdirSync(this.dataDir)
        let totalWords = 0

        for (const file of files) {
          if (file.endsWith('.txt')) {
            const filePath = join(this.dataDir, file)
            const content = readFileSync(filePath, 'utf-8')
            const words = content.split('\n').map((w: string) => w.trim()).filter((w: string) => w.length > 0)

            for (const word of words) {
              this.insertWord(word)
              this.sensitiveWords.add(word)
              totalWords++
            }

            console.log(`✓ 加载敏感词文件: ${file} (${words.length} 个词) / Loaded sensitive word file: ${file} (${words.length} words)`)
          }
        }

        console.log(`✓ 敏感词库加载完成，共 ${totalWords} 个敏感词 / Sensitive word library loaded, total ${totalWords} words`)
      } else {
        // Cloudflare Workers 环境 - 使用内置的基本敏感词 / Cloudflare Workers environment - use built-in basic sensitive words
        console.warn('⚠️ 文件系统不可用，使用内置基本敏感词库 / File system not available, using built-in basic sensitive word library')
        this.loadBuiltinWords()
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠ 敏感词目录不存在: ${this.dataDir}，使用内置基本敏感词库 / Sensitive word directory not found: ${this.dataDir}, using built-in basic sensitive word library`)
        this.loadBuiltinWords()
      } else {
        console.error('⚠ 加载敏感词库失败，使用内置基本敏感词库:', error.message, 'Failed to load sensitive word library, using built-in basic sensitive word library:', error.message)
        this.loadBuiltinWords()
      }
    }
  }

  /**
   * 加载内置的基本敏感词（私有方法）
   * Load Built-in Basic Sensitive Words (Private Method)
   * 
   * 用于 Cloudflare Workers 环境
   * Used for Cloudflare Workers environment
   */
  private loadBuiltinWords(): void {
    const builtinWords = [
      '政治',
      '习近平',
      '敏感词示例'
    ]

    for (const word of builtinWords) {
      this.insertWord(word)
      this.sensitiveWords.add(word)
    }

    console.log(`✓ 内置敏感词库加载完成，共 ${builtinWords.length} 个敏感词 / Built-in sensitive word library loaded, total ${builtinWords.length} words`)
  }

  /**
   * 将敏感词插入 Trie 树（私有方法）
   * Insert Sensitive Word into Trie Tree (Private Method)
   * 
   * @param word - 要插入的敏感词 / Sensitive word to insert
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
   * 处理重叠的匹配结果，只保留最长的匹配（私有方法）
   * Merge Overlapping Match Results, Keep Only Longest Matches (Private Method)
   * 
   * @param matches - 所有匹配结果 / All match results
   * @returns 过滤后的匹配结果 / Filtered match results
   */
  private mergeOverlappingMatches(matches: SensitiveWordMatch[]): SensitiveWordMatch[] {
    if (matches.length === 0) {
      return []
    }

    // 按起始位置和结束位置排序 / Sort by start and end positions
    matches.sort((a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex)

    const result: SensitiveWordMatch[] = []
    let current = matches[0]

    for (let i = 1; i < matches.length; i++) {
      const next = matches[i]

      // 如果下一个匹配与当前匹配重叠 / If the next match overlaps with the current match
      if (next.startIndex <= current.endIndex) {
        // 保留长度更长的匹配 / Keep the longer match
        if (next.endIndex > current.endIndex) {
          current = next
        }
        // 否则跳过较短的匹配 / Otherwise skip the shorter match
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
   * Detect Sensitive Words in Text
   * 
   * 使用 Trie 树结构高效地检测文本中的敏感词
   * Uses Trie tree structure to efficiently detect sensitive words in text
   * 
   * @param text - 待检测的文本 / Text to detect
   * @returns 匹配到的敏感词列表 / List of matched sensitive words
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
   * Check if Text Contains Sensitive Words
   * 
   * @param text - 待检测的文本 / Text to detect
   * @returns 是否包含敏感词 / Whether contains sensitive words
   */
  public contains(text: string): boolean {
    return this.detect(text).length > 0
  }

  /**
   * 过滤敏感词（替换为 ***）
   * Filter Sensitive Words (Replace with ***)
   * 
   * 将检测到的敏感词替换为指定字符
   * Replaces detected sensitive words with specified characters
   * 
   * @param text - 待过滤的文本 / Text to filter
   * @param replacement - 替换字符，默认为 '*' / Replacement character, default is '*'
   * @returns 过滤后的文本 / Filtered text
   */
  public filter(text: string, replacement: string = '*'): string {
    const matches = this.detect(text)
    if (matches.length === 0) {
      return text
    }

    // 按起始位置排序 / Sort by start position
    matches.sort((a, b) => a.startIndex - b.startIndex)

    let result = ''
    let lastIndex = 0

    for (const match of matches) {
      // 添加匹配前的文本 / Add text before match
      result += text.substring(lastIndex, match.startIndex)

      // 添加替换字符 / Add replacement characters
      result += replacement.repeat(match.word.length)

      lastIndex = match.endIndex + 1
    }

    // 添加剩余文本 / Add remaining text
    result += text.substring(lastIndex)

    return result
  }

  /**
   * 获取敏感词统计信息
   * Get Sensitive Word Statistics
   * 
   * @returns 统计信息对象 / Statistics object
   */
  public getStats() {
    return {
      totalWords: this.sensitiveWords.size,
      categories: this.getCategoryStats()
    }
  }

  /**
   * 获取各分类的敏感词数量（私有方法）
   * Get Sensitive Word Count by Category (Private Method)
   * 
   * @returns 分类统计对象 / Category statistics object
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
      console.error('获取分类统计失败 / Failed to get category statistics:', error)
    }

    return stats
  }

  /**
   * 重新加载敏感词库
   * Reload Sensitive Word Library
   * 
   * 清空当前的 Trie 树和敏感词集合，重新加载敏感词库
   * Clears current Trie tree and sensitive word set, reloads sensitive word library
   */
  public reload(): void {
    this.trieRoot = { children: new Map(), isEnd: false }
    this.sensitiveWords.clear()
    this.loadSensitiveWords()
  }
}

// 单例模式 / Singleton pattern
let instance: SensitiveWordService | null = null

/**
 * 获取敏感词服务实例
 * Get Sensitive Word Service Instance
 * 
 * 使用单例模式确保全局只有一个实例
 * Uses singleton pattern to ensure only one instance globally
 * 
 * @returns 敏感词服务实例 / Sensitive word service instance
 */
export function getSensitiveWordService(): SensitiveWordService {
  if (!instance) {
    instance = new SensitiveWordService()
  }
  return instance
}
