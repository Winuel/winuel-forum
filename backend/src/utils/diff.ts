/**
 * Diff工具 - 用于比较代码差异
 */

import type { DiffResult, DiffChange } from '../types/code'

/**
 * 简单的行级Diff算法
 */
export class DiffTool {
  /**
   * 计算两个文本的差异
   */
  static computeDiff(oldText: string, newText: string): DiffResult {
    const oldLines = oldText.split('\n')
    const newLines = newText.split('\n')
    
    const changes: DiffChange[] = []
    const matrix = this.buildLCSMatrix(oldLines, newLines)
    const lcs = this.extractLCS(oldLines, newLines, matrix)
    
    let oldIndex = 0
    let newIndex = 0
    let additions = 0
    let deletions = 0
    
    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      if (oldIndex < oldLines.length && newIndex < newLines.length) {
        if (oldLines[oldIndex] === newLines[newIndex]) {
          // 无变化
          changes.push({
            type: 'unchanged',
            old_line: oldIndex + 1,
            new_line: newIndex + 1,
            old_content: oldLines[oldIndex],
            new_content: newLines[newIndex]
          })
          oldIndex++
          newIndex++
        } else {
          // 检查是否在LCS中
          if (this.isInLCS(oldLines[oldIndex], lcs)) {
            // 旧行在LCS中，新行被删除
            changes.push({
              type: 'deletion',
              old_line: oldIndex + 1,
              old_content: oldLines[oldIndex]
            })
            deletions++
            oldIndex++
          } else if (this.isInLCS(newLines[newIndex], lcs)) {
            // 新行在LCS中，旧行被删除
            changes.push({
              type: 'addition',
              new_line: newIndex + 1,
              new_content: newLines[newIndex]
            })
            additions++
            newIndex++
          } else {
            // 都不在LCS中，可能是修改
            changes.push({
              type: 'deletion',
              old_line: oldIndex + 1,
              old_content: oldLines[oldIndex]
            })
            changes.push({
              type: 'addition',
              new_line: newIndex + 1,
              new_content: newLines[newIndex]
            })
            deletions++
            additions++
            oldIndex++
            newIndex++
          }
        }
      } else if (oldIndex < oldLines.length) {
        // 只有旧行剩余
        changes.push({
          type: 'deletion',
          old_line: oldIndex + 1,
          old_content: oldLines[oldIndex]
        })
        deletions++
        oldIndex++
      } else {
        // 只有新行剩余
        changes.push({
          type: 'addition',
          new_line: newIndex + 1,
          new_content: newLines[newIndex]
        })
        additions++
        newIndex++
      }
    }
    
    return {
      old_text: oldText,
      new_text: newText,
      additions,
      deletions,
      changes
    }
  }
  
  /**
   * 构建LCS矩阵
   */
  private static buildLCSMatrix<T>(arr1: T[], arr2: T[]): number[][] {
    const m = arr1.length
    const n = arr2.length
    const matrix: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1])
        }
      }
    }
    
    return matrix
  }
  
  /**
   * 提取最长公共子序列
   */
  private static extractLCS<T>(arr1: T[], arr2: T[], matrix: number[][]): T[] {
    const lcs: T[] = []
    let i = arr1.length
    let j = arr2.length
    
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        lcs.unshift(arr1[i - 1])
        i--
        j--
      } else if (matrix[i - 1][j] > matrix[i][j - 1]) {
        i--
      } else {
        j--
      }
    }
    
    return lcs
  }
  
  /**
   * 检查元素是否在LCS中
   */
  private static isInLCS<T>(element: T, lcs: T[]): boolean {
    return lcs.includes(element)
  }
  
  /**
   * 生成统一的diff格式（用于显示）
   */
  static generateUnifiedDiff(oldText: string, newText: string): string {
    const diff = this.computeDiff(oldText, newText)
    let result = '--- a/original\n+++ b/modified\n'
    
    for (const change of diff.changes) {
      switch (change.type) {
        case 'addition':
          result += `+${change.new_content}\n`
          break
        case 'deletion':
          result += `-${change.old_content}\n`
          break
        case 'unchanged':
          result += ` ${change.old_content}\n`
          break
      }
    }
    
    return result
  }
  
  /**
   * 获取差异摘要
   */
  static getDiffSummary(oldText: string, newText: string): {
    hasChanges: boolean
    additions: number
    deletions: number
    changes: number
    percentage: number
  } {
    const diff = this.computeDiff(oldText, newText)
    const totalLines = oldText.split('\n').length
    const percentage = totalLines > 0 ? Math.round(((diff.additions + diff.deletions) / totalLines) * 100) : 0
    
    return {
      hasChanges: diff.additions > 0 || diff.deletions > 0,
      additions: diff.additions,
      deletions: diff.deletions,
      changes: diff.additions + diff.deletions,
      percentage
    }
  }
}
