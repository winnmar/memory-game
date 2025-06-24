<template>
  <div
    class="notification"
    :class="type"
  >
    <span>{{ message }}</span>
    <button
      class="notification-close"
      :class="type"
      @click="closeNotification"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  type: 'success' | 'error'
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function closeNotification() {
  emit('close')
}
</script>

<style scoped>
.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-radius: 8px;
  margin: 10px 0;
  animation: slideIn 0.3s ease-out;
  word-wrap: break-word;
}

.notification.success {
  color: var(--text-color-notification-success);
  background: var(--background-color-notification-success);
}

.notification.error {
  color: var(--text-color-notification-error);
  background: var(--background-color-notification-error);
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  padding: 0;
  margin-left: 15px;
  line-height: 1;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.notification-close.success {
    color: var(--text-color-notification-success);
}

.notification-close.error {
    color: var(--text-color-notification-error);
}

.notification-close.success:hover {
  color: var(--text-color-notification-success-hover);
}

.notification-close.error:hover {
  color: var(--text-color-notification-error-hover);
}
</style>
