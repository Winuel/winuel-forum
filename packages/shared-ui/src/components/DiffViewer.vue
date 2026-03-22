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
import type { DiffViewerProps, DiffResult } from '@cloudlink/shared-core'

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
      // Unchanged line
      if (oldLine !== undefined || newLine !== undefined) {
        changes.push({
          type: 'unchanged',
          old_line: oldIndex + 1,
          new_line: newIndex + 1,
          old_content: oldLine || '',
          new_content: newLine || ''
        })
      }
      oldIndex++
      newIndex++
    } else if (oldLine === undefined) {
      // Addition only
      changes.push({
        type: 'addition',
        new_line: newIndex + 1,
        new_content: newLine
      })
      additions++
      newIndex++
    } else if (newLine === undefined) {
      // Deletion only
      changes.push({
        type: 'deletion',
        old_line: oldIndex + 1,
        old_content: oldLine
      })
      deletions++
      oldIndex++
    } else {
      // Different line - treat as deletion + addition
      changes.push({
        type: 'deletion',
        old_line: oldIndex + 1,
        old_content: oldLine
      })
      changes.push({
        type: 'addition',
        new_line: newIndex + 1,
        new_content: newLine
      })
      deletions++
      additions++
      oldIndex++
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

const diffResult = computed(() => computeDiff(props.oldContent, props.newContent))

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
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
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
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.diff-line {
  display: flex;
}

.line-number {
  display: flex;
  flex-direction: column;
  min-width: 50px;
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
}

.old-line,
.new-line {
  padding: 0.125rem 0.5rem;
  text-align: right;
  color: #6b7280;
  font-size: 0.75rem;
}

.line-content {
  display: flex;
  flex: 1;
  padding: 0.125rem 0.5rem;
}

.line-content.addition {
  background-color: #d1fae5;
}

.line-content.deletion {
  background-color: #fee2e2;
}

.line-content.unchanged {
  background-color: transparent;
}

.line-marker {
  width: 1rem;
  font-weight: bold;
}

.line-content.addition .line-marker {
  color: #065f46;
}

.line-content.deletion .line-marker {
  color: #991b1b;
}

.line-text {
  flex: 1;
  white-space: pre;
}
</style>