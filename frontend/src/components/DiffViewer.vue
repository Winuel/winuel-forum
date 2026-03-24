<template>
  <div class="diff-viewer">
    <div class="diff-header">
      <h3 class="diff-title">代码变更</h3>
      <div class="diff-stats">
        <span class="stat additions">+{{ diffResult.additions }} 添加</span>
        <span class="stat deletions">-{{ diffResult.deletions }} 删除</span>
      </div>
    </div>

    <div class="diff-content">
      <div v-for="(change, index) in diffResult.changes" :key="index" class="diff-line">
        <div class="line-number">
          <span v-if="change.old_line" class="old-line">{{ change.old_line }}</span>
          <span v-if="change.new_line" class="new-line">{{ change.new_line }}</span>
        </div>
        <div class="line-content" :class="change.type">
          <span class="line-marker">{{ getLineMarker(change.type) }}</span>
          <span class="line-text">{{ change.type === 'deletion' ? change.old_content : change.new_content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DiffViewerProps } from '../types/code'
import type { DiffResult } from '../types/code'

const props = withDefaults(defineProps<DiffViewerProps>(), {
  inline: true
})

// Simple diff implementation using line-by-line comparison
const computeDiff = (oldText: string, newText: string): DiffResult => {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  
  const changes: DiffResult['changes'] = []
  let oldIndex = 0
  let newIndex = 0
  let additions = 0
  let deletions = 0

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex]
    const newLine = newLines[newIndex]

    if (oldLine === newLine) {
      // Lines are the same
      changes.push({
        type: 'unchanged',
        old_line: oldIndex + 1,
        new_line: newIndex + 1,
        old_content: oldLine,
        new_content: newLine
      })
      oldIndex++
      newIndex++
    } else {
      // Lines differ
      if (oldIndex < oldLines.length && newIndex < newLines.length) {
        // Check if this line appears later in the other version
        const oldInNew = newLines.indexOf(oldLine, newIndex)
        const newInOld = oldLines.indexOf(newLine, oldIndex)

        if (oldInNew === -1 && newInOld === -1) {
          // Both lines are unique, delete old and add new
          if (oldLine !== undefined) {
            changes.push({
              type: 'deletion',
              old_line: oldIndex + 1,
              old_content: oldLine
            })
            deletions++
            oldIndex++
          }
          if (newLine !== undefined) {
            changes.push({
              type: 'addition',
              new_line: newIndex + 1,
              new_content: newLine
            })
            additions++
            newIndex++
          }
        } else if (oldInNew !== -1) {
          // Old line appears later, so new lines were added
          changes.push({
            type: 'addition',
            new_line: newIndex + 1,
            new_content: newLine
          })
          additions++
          newIndex++
        } else {
          // New line appears later, so old lines were deleted
          changes.push({
            type: 'deletion',
            old_line: oldIndex + 1,
            old_content: oldLine
          })
          deletions++
          oldIndex++
        }
      } else if (oldIndex < oldLines.length) {
        // Only old lines remain
        changes.push({
          type: 'deletion',
          old_line: oldIndex + 1,
          old_content: oldLine
        })
        deletions++
        oldIndex++
      } else {
        // Only new lines remain
        changes.push({
          type: 'addition',
          new_line: newIndex + 1,
          new_content: newLine
        })
        additions++
        newIndex++
      }
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

const diffResult = computed(() => {
  return computeDiff(props.oldContent, props.newContent)
})

const getLineMarker = (type: string): string => {
  const markers: Record<string, string> = {
    addition: '+',
    deletion: '-',
    unchanged: ' '
  }
  return markers[type] || ' '
}
</script>

<style scoped>
.diff-viewer {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  margin: 1rem 0;
  background-color: #ffffff;
}

.diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.diff-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.diff-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.stat.additions {
  background-color: #d1fae5;
  color: #065f46;
}

.stat.deletions {
  background-color: #fee2e2;
  color: #991b1b;
}

.diff-content {
  max-height: 500px;
  overflow-y: auto;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.diff-line {
  display: flex;
  min-height: 1.5rem;
}

.diff-line:nth-child(odd) {
  background-color: #fafafa;
}

.line-number {
  display: flex;
  min-width: 80px;
  background-color: #f3f4f6;
  border-right: 1px solid #e5e7eb;
  padding: 0 0.5rem;
  user-select: none;
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.5;
}

.old-line,
.new-line {
  flex: 1;
  text-align: right;
  padding: 0 0.25rem;
}

.line-content {
  flex: 1;
  display: flex;
  padding: 0 0.75rem;
  white-space: pre;
  overflow-x: auto;
}

.line-content.unchanged {
  background-color: transparent;
}

.line-content.addition {
  background-color: #d1fae5;
  color: #065f46;
}

.line-content.deletion {
  background-color: #fee2e2;
  color: #991b1b;
}

.line-marker {
  min-width: 1.5rem;
  user-select: none;
  font-weight: 600;
}

.line-text {
  flex: 1;
}

/* Custom scrollbar */
.diff-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.diff-content::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.diff-content::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
}

.diff-content::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>