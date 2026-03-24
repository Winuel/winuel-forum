<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  show: boolean
  postTitle: string
  auditReason: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [reason: string]
}>()

const reason = ref('')

const handleSubmit = () => {
  if (reason.value.trim().length === 0) {
    return
  }
  emit('submit', reason.value.trim())
  reason.value = ''
  emit('close')
}

const handleCancel = () => {
  reason.value = ''
  emit('close')
}

watch(() => props.show, (newVal) => {
  if (!newVal) {
    reason.value = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="handleCancel"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">申诉帖子</h3>
              <button
                @click="handleCancel"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="mb-6">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">帖子标题</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ postTitle }}</p>
            </div>

            <div class="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div class="flex items-start gap-3">
                <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.832-3.094 0 0-1.223-.082-2.815.563"
                  />
                </svg>
                <div class="flex-1">
                  <p class="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">审核拒绝理由</p>
                  <p class="text-sm text-yellow-700 dark:text-yellow-300">{{ auditReason }}</p>
                </div>
              </div>

              <div class="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  如果您认为此帖子被误判，可以提交申诉。管理员将会重新审核您的帖子。
                </p>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                申诉理由 <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="reason"
                rows="4"
                class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                placeholder="请说明申诉理由，为什么认为这个帖子被误判..."
              />
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                请详细说明申诉理由，这有助于管理员更快地处理您的申诉
              </p>
            </div>

            <div class="flex gap-3">
              <button
                @click="handleCancel"
                class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                取消
              </button>
              <button
                @click="handleSubmit"
                :disabled="!reason.trim()"
                class="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交申诉
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}

.modal-enter-to > div,
.modal-leave-from > div {
  transform: scale(1);
}
</style>