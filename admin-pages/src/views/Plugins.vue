<template>
  <div class="plugins-manager">
    <div class="plugins-header">
      <h1>插件管理</h1>
      <button @click="showUploadDialog = true" class="btn btn-primary">
        安装插件
      </button>
    </div>

    <div class="plugins-stats">
      <div class="stat-card">
        <div class="stat-label">已安装</div>
        <div class="stat-value">{{ plugins.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已激活</div>
        <div class="stat-value">{{ activePlugins.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">错误</div>
        <div class="stat-value">{{ errorPlugins.length }}</div>
      </div>
    </div>

    <div class="plugins-list">
      <div v-for="plugin in plugins" :key="plugin.id" class="plugin-card">
        <div class="plugin-header">
          <div class="plugin-info">
            <h3>{{ plugin.manifest.name }}</h3>
            <p class="plugin-version">v{{ plugin.version }}</p>
            <p class="plugin-author">{{ plugin.manifest.author }}</p>
          </div>
          <div class="plugin-status" :class="plugin.status">
            <span class="status-dot"></span>
            <span class="status-text">{{ getStatusText(plugin.status) }}</span>
          </div>
        </div>

        <div class="plugin-description">
          {{ plugin.manifest.description }}
        </div>

        <div class="plugin-tags">
          <span v-for="keyword in plugin.manifest.keywords" :key="keyword" class="tag">
            {{ keyword }}
          </span>
        </div>

        <div class="plugin-actions">
          <button
            v-if="plugin.status === 'installed' && !plugin.enabled"
            @click="activatePlugin(plugin.id)"
            class="btn btn-success btn-sm"
          >
            激活
          </button>
          <button
            v-if="plugin.status === 'active' && plugin.enabled"
            @click="deactivatePlugin(plugin.id)"
            class="btn btn-warning btn-sm"
          >
            停用
          </button>
          <button
            @click="showConfigDialog(plugin)"
            class="btn btn-secondary btn-sm"
          >
            配置
          </button>
          <button
            @click="confirmUninstall(plugin)"
            class="btn btn-danger btn-sm"
          >
            卸载
          </button>
        </div>

        <div v-if="plugin.error" class="plugin-error">
          <strong>错误:</strong> {{ plugin.error }}
        </div>
      </div>
    </div>

    <!-- 上传插件对话框 -->
    <div v-if="showUploadDialog" class="modal-overlay" @click.self="showUploadDialog = false">
      <div class="modal">
        <div class="modal-header">
          <h2>安装插件</h2>
          <button @click="showUploadDialog = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>选择插件包</label>
            <input
              ref="fileInput"
              type="file"
              accept=".json,.zip"
              @change="handleFileSelect"
            />
          </div>
          <div v-if="selectedFile" class="file-info">
            <p><strong>文件名:</strong> {{ selectedFile.name }}</p>
            <p><strong>大小:</strong> {{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showUploadDialog = false" class="btn btn-secondary">
            取消
          </button>
          <button
            @click="installSelectedPlugin"
            :disabled="!selectedFile || installing"
            class="btn btn-primary"
          >
            {{ installing ? '安装中...' : '安装' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 配置对话框 -->
    <div v-if="showConfigDialogFlag" class="modal-overlay" @click.self="closeConfigDialog">
      <div class="modal modal-large">
        <div class="modal-header">
          <h2>配置插件 - {{ currentPlugin?.manifest.name }}</h2>
          <button @click="closeConfigDialog" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div v-if="currentPlugin" class="config-form">
            <div
              v-for="(prop, key) in currentPlugin.manifest.configSchema.properties"
              :key="key"
              class="form-group"
            >
              <label :for="key">{{ prop.title }}</label>
              <p v-if="prop.description" class="field-description">{{ prop.description }}</p>

              <input
                v-if="prop.type === 'string'"
                :id="key"
                v-model="pluginConfig[key]"
                :placeholder="prop.default || ''"
                class="form-control"
              />
              <input
                v-if="prop.type === 'number'"
                :id="key"
                v-model.number="pluginConfig[key]"
                :placeholder="prop.default || ''"
                class="form-control"
                type="number"
              />
              <input
                v-if="prop.type === 'boolean'"
                :id="key"
                v-model="pluginConfig[key]"
                class="form-checkbox"
                type="checkbox"
              />
              <select
                v-if="prop.enum"
                :id="key"
                v-model="pluginConfig[key]"
                class="form-control"
              >
                <option v-for="option in prop.enum" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeConfigDialog" class="btn btn-secondary">
            取消
          </button>
          <button
            @click="savePluginConfig"
            :disabled="savingConfig"
            class="btn btn-primary"
          >
            {{ savingConfig ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 确认卸载对话框 -->
    <div v-if="showUninstallDialogFlag" class="modal-overlay" @click.self="cancelUninstall">
      <div class="modal">
        <div class="modal-header">
          <h2>确认卸载</h2>
          <button @click="cancelUninstall" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <p>确定要卸载插件 <strong>{{ pluginToUninstall?.manifest.name }}</strong> 吗？</p>
          <p class="warning">此操作将删除插件的所有数据和配置，且无法恢复。</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelUninstall" class="btn btn-secondary">
            取消
          </button>
          <button
            @click="confirmUninstallAction"
            :disabled="uninstalling"
            class="btn btn-danger"
          >
            {{ uninstalling ? '卸载中...' : '确认卸载' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 提示信息 -->
    <div v-if="message" class="alert" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  getAllPlugins,
  getActivePlugins,
  installPlugin,
  activatePlugin,
  deactivatePlugin,
  uninstallPlugin,
  updatePluginConfig,
  getPluginConfig,
  type Plugin
} from '../api/plugins'

const plugins = ref<Plugin[]>([])
const activePlugins = ref<Plugin[]>([])
const showUploadDialog = ref(false)
const showConfigDialogFlag = ref(false)
const showUninstallDialogFlag = ref(false)
const currentPlugin = ref<Plugin | null>(null)
const pluginToUninstall = ref<Plugin | null>(null)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const pluginConfig = ref<Record<string, any>>({})
const installing = ref(false)
const savingConfig = ref(false)
const uninstalling = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | 'warning'>('success')

const errorPlugins = computed(() => {
  return plugins.value.filter(p => p.status === 'error')
})

onMounted(async () => {
  await loadPlugins()
})

async function loadPlugins() {
  try {
    plugins.value = await getAllPlugins()
    activePlugins.value = await getActivePlugins()
  } catch (error: any) {
    showMessage('加载插件列表失败: ' + error.message, 'error')
  }
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    installed: '已安装',
    active: '已激活',
    inactive: '已停用',
    error: '错误',
    loading: '加载中'
  }
  return statusMap[status] || status
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

async function installSelectedPlugin() {
  if (!selectedFile.value) return

  installing.value = true
  try {
    const file = selectedFile.value
    const text = await file.text()
    const pluginPackage = JSON.parse(text)

    await installPlugin(pluginPackage)
    showMessage('插件安装成功', 'success')
    showUploadDialog.value = false
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    await loadPlugins()
  } catch (error: any) {
    showMessage('插件安装失败: ' + error.message, 'error')
  } finally {
    installing.value = false
  }
}

async function activatePlugin(pluginId: string) {
  try {
    await activatePlugin(pluginId)
    showMessage('插件激活成功', 'success')
    await loadPlugins()
  } catch (error: any) {
    showMessage('插件激活失败: ' + error.message, 'error')
  }
}

async function deactivatePlugin(pluginId: string) {
  try {
    await deactivatePlugin(pluginId)
    showMessage('插件停用成功', 'success')
    await loadPlugins()
  } catch (error: any) {
    showMessage('插件停用失败: ' + error.message, 'error')
  }
}

async function showConfigDialog(plugin: Plugin) {
  currentPlugin.value = plugin
  try {
    pluginConfig.value = await getPluginConfig(plugin.id)
  } catch (error) {
    pluginConfig.value = {}
  }
  showConfigDialogFlag.value = true
}

function closeConfigDialog() {
  showConfigDialogFlag.value = false
  currentPlugin.value = null
  pluginConfig.value = {}
}

async function savePluginConfig() {
  if (!currentPlugin.value) return

  savingConfig.value = true
  try {
    await updatePluginConfig(currentPlugin.value.id, pluginConfig.value)
    showMessage('插件配置保存成功', 'success')
    closeConfigDialog()
  } catch (error: any) {
    showMessage('插件配置保存失败: ' + error.message, 'error')
  } finally {
    savingConfig.value = false
  }
}

function confirmUninstall(plugin: Plugin) {
  pluginToUninstall.value = plugin
  showUninstallDialogFlag.value = true
}

function cancelUninstall() {
  showUninstallDialogFlag.value = false
  pluginToUninstall.value = null
}

async function confirmUninstallAction() {
  if (!pluginToUninstall.value) return

  uninstalling.value = true
  try {
    await uninstallPlugin(pluginToUninstall.value.id)
    showMessage('插件卸载成功', 'success')
    showUninstallDialogFlag.value = false
    pluginToUninstall.value = null
    await loadPlugins()
  } catch (error: any) {
    showMessage('插件卸载失败: ' + error.message, 'error')
  } finally {
    uninstalling.value = false
  }
}

function showMessage(msg: string, type: 'success' | 'error' | 'warning') {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>

<style scoped>
.plugins-manager {
  padding: 20px;
}

.plugins-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.plugins-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.plugins-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-label {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
}

.plugins-list {
  display: grid;
  gap: 16px;
}

.plugin-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.plugin-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
}

.plugin-version {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.plugin-author {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.plugin-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.plugin-status.installed {
  background: #f0f0f0;
  color: #666;
}

.plugin-status.installed .status-dot {
  background: #999;
}

.plugin-status.active {
  background: #e6f7ff;
  color: #1890ff;
}

.plugin-status.active .status-dot {
  background: #52c41a;
}

.plugin-status.inactive {
  background: #fff7e6;
  color: #fa8c16;
}

.plugin-status.inactive .status-dot {
  background: #fa8c16;
}

.plugin-status.error {
  background: #fff1f0;
  color: #f5222d;
}

.plugin-status.error .status-dot {
  background: #f5222d;
}

.plugin-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.plugin-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tag {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.plugin-actions {
  display: flex;
  gap: 8px;
}

.plugin-error {
  margin-top: 12px;
  padding: 12px;
  background: #fff1f0;
  border: 1px solid #ffa39e;
  border-radius: 4px;
  color: #f5222d;
  font-size: 14px;
}

.btn {
  padding: 6px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #d9d9d9;
}

.btn-success {
  background: #52c41a;
  color: white;
}

.btn-success:hover {
  background: #73d13d;
}

.btn-warning {
  background: #fa8c16;
  color: white;
}

.btn-warning:hover {
  background: #ffa940;
}

.btn-danger {
  background: #f5222d;
  color: white;
}

.btn-danger:hover {
  background: #ff4d4f;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 13px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.btn-close:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.field-description {
  margin: 4px 0 8px 0;
  font-size: 13px;
  color: #999;
}

.form-control,
.form-checkbox {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus,
.form-checkbox:focus {
  outline: none;
  border-color: #1890ff;
}

.form-checkbox {
  width: auto;
}

.file-info {
  margin-top: 12px;
  padding: 12px;
  background: #f0f0f0;
  border-radius: 4px;
}

.file-info p {
  margin: 4px 0;
  font-size: 14px;
}

.warning {
  color: #fa8c16;
  font-weight: 500;
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.alert.success {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}

.alert.error {
  background: #fff1f0;
  border: 1px solid #ffa39e;
  color: #f5222d;
}

.alert.warning {
  background: #fff7e6;
  border: 1px solid #ffe58f;
  color: #fa8c16;
}
</style>