<template>
  <button
    type="button"
    class="icon-button download-button"
    :disabled="disabled"
    :title="label"
    :aria-label="label"
    @click.stop="$emit('download', song)"
  >
    <span v-if="activeId === song?.id" class="download-button__spinner"></span>
    <AppIcon v-else name="download" :size="17" />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  song: Object,
  state: { type: Object, required: true },
  activeId: [Number, String],
})
defineEmits(['download'])
const disabled = computed(
  () =>
    !props.song || !!props.activeId || !!props.song.localUrl || props.state.status !== 'available',
)
const label = computed(() => {
  if (!props.song) return '选择歌曲后下载'
  if (props.activeId === props.song.id) return '正在下载…'
  if (props.activeId) return '请等待当前下载完成'
  if (props.song.localUrl) return '此歌曲已是本地文件'
  if (props.state.status !== 'available')
    return `${props.state.label || '权限未确认'}，暂不支持下载`
  return `下载 ${props.song.name}`
})
</script>

<style scoped lang="scss">
.download-button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}
.download-button__spinner {
  width: 13px;
  height: 13px;
  border: 1.5px solid #ed6c4630;
  border-top-color: #ed6c46;
  border-radius: 50%;
  animation: download-spin 0.8s linear infinite;
}
@keyframes download-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .download-button__spinner {
    animation: none;
  }
}
</style>
