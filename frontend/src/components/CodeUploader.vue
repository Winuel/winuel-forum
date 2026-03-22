<template>
  <div class="code-uploader">
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'uploading': uploading }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".js,.ts,.py,.java,.c,.cpp,.cs,.go,.rs,.php,.rb,.swift,.kt,.html,.css,.json,.yaml,.sql,.md,.sh,.bash,.txt"
        @change="handleFileSelect"
        style="display: none"
      />
      
      <div class="upload-content">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88 7.5M9 19h6a2 2 0 002-2V7a2 2 0 00-2-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2v-1m0 0c1.5 0 3 .5 4.5 2 3-2 1.5-3 .5-4.5-2-3-1.5-3-.5-4.5-2v-1m0 0c1.5 0 3 .5 4.5 2 3-2 1.5-3 .5-4.5-2-3-1.5-3-.5-4.5-2-3-1.5-3-.5-4.5-2-3-1.5-3-.5-4.5-2-3M7 16a4 4 0 01-.88 7.5M9 19h6a2 2 0 002-2V7a2 2 0 00-2-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2v-1m0 0c1.5 0 3 .5 4.5 2 3-2 1.5-3 .5-4.5-2-3-2 1.5-3 .5-4.5-2-3-1.5-3-.5-4.5-2-3-1.5-3-.5-4.5-2-3M7 16a4 4 0 01-.88 7.5M9 19h6a2 2 0 002-2V7a2 2 0 00-2-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2v-1" />
        </svg>
        <p class="upload-text">{{ uploading ? '上传中...' : '点击或拖拽代码文件到此处上传' }}</p>
        <p class="upload-hint">支持 .js, .ts, .py, .java 等代码文件，最大 512KB</p>
      </div>
    </div>

    <!-- 上传的文件列表 -->
    <div v-if="uploadedFiles.length > 0" class="uploaded-files">
      <div
        v-for="(file, index) in uploadedFiles"
        :key="index"
        class="uploaded-file"
      >
        <div class="file-info">
          <span class="file-name">{{ file.fileName }}</span>
          <span class="file-size">{{ formatFileSize(file.fileSize) }}</span>
          <span class="file-status" :class="file.status">
            {{ getStatusText(file.status) }}
          </span>
        </div>
        <button
          v-if="file.status === 'error'"
          class="retry-btn"
          @click="retryUpload(file)"
        >
          重试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFile, UploadOptions } from '../types/code'
import type { CodeAttachment } from '../types/code'
import { apiClient } from '../api/client'

interface UploadedFile extends UploadFile {
  status: 'uploading' | 'success' | 'error'
  attachment?: CodeAttachment
  error?: string
}

const props = defineProps<UploadOptions>()

const emit = defineEmits<{
  'upload-success': [attachment: CodeAttachment]
  'upload-error': [error: string]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const uploading = ref(false)
const uploadedFiles = ref<UploadedFile[]>([])

const MAX_FILE_SIZE = props.maxFileSize || 512 // KB

const detectLanguage = (fileName: string): any => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, any> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby',
    swift: 'swift',
    kt: 'kotlin',
    html: 'html',
    css: 'css',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    sql: 'sql',
    md: 'markdown',
    sh: 'bash',
    bash: 'bash',
    txt: 'other'
  }
  return languageMap[ext as string] || 'other'
}

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

const validateFileSize = (file: File): boolean => {
  const sizeInKB = file.size / 1024
  return sizeInKB <= MAX_FILE_SIZE
}

const uploadFileFunc = async (uploadFile: UploadedFile) => {
  uploadFile.status = 'uploading'
  
  try {
    const response = await apiClient.post('/api/attachments/upload', {
      post_id: props.postId,
      file_name: uploadFile.fileName,
      language: uploadFile.language,
      content: uploadFile.content
    })
    
    uploadFile.status = 'success'
    const responseData = response as { data: CodeAttachment }
    uploadFile.attachment = responseData.data
    
    props.onUploadSuccess?.(responseData.data)
    emit('upload-success', responseData.data)
  } catch (error: any) {
    uploadFile.status = 'error'
    uploadFile.error = error.message || '上传失败'
    
    props.onUploadError?.(uploadFile.error || '上传失败')
    emit('upload-error', uploadFile.error || '上传失败')
  }
}

const processFile = async (file: File) => {
  if (!validateFileSize(file)) {
    const error = `文件大小超过${MAX_FILE_SIZE}KB限制`
    uploadedFiles.value.push({
      file,
      content: '',
      language: 'other',
      fileName: file.name,
      fileSize: file.size / 1024,
      status: 'error',
      error
    })
    return
  }
  
  try {
    const content = await readFile(file)
    const language = detectLanguage(file.name)
    
    const uploadFileObj: UploadedFile = {
      file,
      content,
      language,
      fileName: file.name,
      fileSize: file.size / 1024,
      status: 'uploading'
    }
    
    uploadedFiles.value.push(uploadFileObj)
    await uploadFileFunc(uploadFileObj)
  } catch (error) {
    uploadedFiles.value.push({
      file,
      content: '',
      language: 'other',
      fileName: file.name,
      fileSize: file.size / 1024,
      status: 'error',
      error: '文件读取失败'
    })
  }
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = async (e: DragEvent) => {
  isDragOver.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    for (const file of Array.from(files)) {
      await processFile(file)
    }
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    for (const file of Array.from(files)) {
      await processFile(file)
    }
  }
  // Reset input
  target.value = ''
}

const retryUpload = async (file: UploadedFile) => {
  await uploadFileFunc(file)
}

const formatFileSize = (size: number): string => {
  if (size < 1) {
    return `${(size * 1024).toFixed(0)} B`
  } else if (size < 1024) {
    return `${size.toFixed(2)} KB`
  } else {
    return `${(size / 1024).toFixed(2)} MB`
  }
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    uploading: '上传中',
    success: '成功',
    error: '失败'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.code-uploader {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f9fafb;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #dbeafe;
}

.upload-area.uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: #9ca3af;
}

.upload-text {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6b7280;
}

.uploaded-files {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.uploaded-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-name {
  font-weight: 500;
  color: #111827;
}

.file-size {
  font-size: 0.875rem;
  color: #6b7280;
}

.file-status {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.file-status.uploading {
  background-color: #dbeafe;
  color: #1e40af;
}

.file-status.success {
  background-color: #d1fae5;
  color: #065f46;
}

.file-status.error {
  background-color: #fee2e2;
  color: #991b1b;
}

.retry-btn {
  padding: 0.25rem 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #2563eb;
}
</style>
