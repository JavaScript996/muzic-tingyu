<template>
  <span
    v-if="state.label"
    :class="['song-availability', `song-availability--${state.status}`]"
    :title="state.label"
    role="status"
    >{{ state.label }}</span
  >
</template>

<script setup>
defineProps({ state: { type: Object, required: true } })
</script>

<style scoped lang="scss">
.song-availability {
  flex-shrink: 0;
  padding: 2px 5px;
  border: 1px solid #dce2e6;
  border-radius: 4px;
  color: #8b959c;
  font-size: 9px;
  font-weight: 400;
  line-height: 1.4;
  white-space: nowrap;
}
.song-availability--vip {
  border-color: #ead9ad;
  color: #a67c2c;
  background: #faf5e7;
}
.song-availability--copyright,
.song-availability--unavailable {
  border-color: #e3dfdd;
  color: #a08b83;
  background: #f5f1ed;
}
.song-availability--preview {
  border-color: #c9dff7;
  color: #4b8dcc;
  background: #edf5ff;
}
.song-availability--checking {
  color: #7891a5;
  background: #f0f5f8;
}
</style>
