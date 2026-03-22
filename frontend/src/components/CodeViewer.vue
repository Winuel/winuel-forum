<template>
  <div class="code-viewer">
    <!-- Header with file info -->
    <div class="code-header" @click="toggleCollapse">
      <div class="header-info">
        <svg class="collapse-icon" :class="{ 'collapsed': isCollapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        <span class="file-name">{{ attachment.file_name }}</span>
        <span class="language-tag">{{ displayLanguage }}</span>
        <span class="version-tag">v{{ attachment.version }}</span>
      </div>
      <div class="header-actions">
        <button v-if="showCopyButton" class="action-btn" @click.stop="copyCode" title="复制代码">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Code content -->
    <div v-if="!isCollapsed" class="code-content">
      <pre :class="['code-block', `language-${attachment.language}`]"><code ref="codeRef">{{ attachment.content }}</code></pre>
    </div>

    <!-- Footer with metadata -->
    <div v-if="!isCollapsed" class="code-footer">
      <span class="meta-info">
        上传时间：{{ formatDate(attachment.created_at) }}
      </span>
      <span class="meta-info">
        文件大小：{{ formatFileSize(attachment.content.length) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CodeViewerProps } from '../types/code'

const props = withDefaults(defineProps<CodeViewerProps>(), {
  initiallyCollapsed: true,
  showLineNumbers: true,
  showCopyButton: true
})

const isCollapsed = ref(props.initiallyCollapsed)
const codeRef = ref<HTMLElement | null>(null)

const displayLanguage = computed(() => {
  const languageNames: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    php: 'PHP',
    ruby: 'Ruby',
    swift: 'Swift',
    kotlin: 'Kotlin',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    yaml: 'YAML',
    sql: 'SQL',
    markdown: 'Markdown',
    bash: 'Bash',
    shell: 'Shell',
    other: 'Text'
  }
  return languageNames[props.attachment.language] || 'Text'
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.attachment.content)
    alert('代码已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (_contentLength: number): string => {
  const sizeInBytes = new Blob([props.attachment.content]).size
  const sizeInKB = sizeInBytes / 1024
  if (sizeInKB < 1) {
    return `${sizeInBytes} B`
  } else if (sizeInKB < 1024) {
    return `${sizeInKB.toFixed(2)} KB`
  } else {
    return `${(sizeInKB / 1024).toFixed(2)} MB`
  }
}

onMounted(() => {
  // Add basic syntax highlighting class
  if (codeRef.value) {
    codeRef.value.classList.add('highlighted')
  }
})
</script>

<style scoped>
.code-viewer {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  margin: 1rem 0;
  background-color: #ffffff;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.code-header:hover {
  background-color: #f3f4f6;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.collapse-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
  transition: transform 0.3s;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.file-name {
  font-weight: 600;
  color: #111827;
}

.language-tag {
  padding: 0.125rem 0.5rem;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.version-tag {
  padding: 0.125rem 0.5rem;
  background-color: #d1fae5;
  color: #065f46;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  background-color: transparent;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
  border-color: #9ca3af;
}

.action-btn svg {
  width: 1rem;
  height: 1rem;
}

.code-content {
  max-height: 400px;
  overflow-y: auto;
}

.code-block {
  margin: 0;
  padding: 1rem;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  background-color: #1e1e1e;
  color: #d4d4d4;
  overflow-x: auto;
}

.code-block code {
  display: block;
  white-space: pre;
}

/* Basic syntax highlighting colors */
.code-block .keyword {
  color: #569cd6;
}

.code-block .string {
  color: #ce9178;
}

.code-block .comment {
  color: #6a9955;
}

.code-block .function {
  color: #dcdcaa;
}

.code-block .number {
  color: #b5cea8;
}

.code-block .operator {
  color: #d4d4d4;
}

.code-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.meta-info {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Custom scrollbar */
.code-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.code-content::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>