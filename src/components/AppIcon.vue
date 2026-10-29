<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.music" />
  </svg>
</template>

<script setup>
defineProps({ name: String, size: { type: [Number, String], default: 20 } })
const paths = {
  sparkles: 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z M20 2v4 M18 4h4',
  music:
    'M9 18V5l12-2v13 M9 8l12-2 M9 18a3 3 0 1 1-3-3c1.7 0 3 1 3 3 M21 16a3 3 0 1 1-3-3c1.7 0 3 1 3 3',
  discover: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M16 8l-3 5-5 3 3-5z',
  radio:
    'M4 11a8 8 0 0 1 16 0 M7 11a5 5 0 0 1 10 0 M12 11v10 M9 21h6 M11 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0',
  chart: 'M5 20V10h3v10 M11 20V4h3v16 M17 20v-7h3v7',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2',
  folder: 'M3 7V4h6l2 3h10v13H3z',
  plus: 'M12 5v14 M5 12h14',
  search: 'M21 21l-5-5 M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0',
  left: 'M14 6l-6 6 6 6',
  right: 'M10 6l6 6-6 6',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',
  bell: 'M5 17h14l-2-4V9A5 5 0 0 0 7 9v4z M10 21h4',
  play: 'M8 5l11 7-11 7z',
  pause: 'M8 5v14 M16 5v14',
  previous: 'M5 5v14 M19 5L8 12l11 7z',
  next: 'M19 5v14 M5 5l11 7-11 7z',
  shuffle:
    'M3 6h3c5 0 7 12 12 12h3 M17 14l4 4-4 4 M3 18h3c2 0 4-2 5-5 M14 8c1-1 2-2 4-2h3 M17 2l4 4-4 4',
  repeat: 'M3 11V7h17 M16 3l4 4-4 4 M21 13v4H4 M8 13l-4 4 4 4',
  volume: 'M4 9h4l5-4v14l-5-4H4z M17 8a6 6 0 0 1 0 8 M20 5a10 10 0 0 1 0 14',
  mute: 'M4 9h4l5-4v14l-5-4H4z M17 9l5 6 M22 9l-5 6',
  queue: 'M4 5h16 M4 11h16 M4 17h9 M17 15l5 4-5 3z',
  expand: 'M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5',
  close: 'M6 6l12 12 M18 6L6 18',
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  download: 'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',
  headphones: 'M4 15v-3a8 8 0 0 1 16 0v3 M4 13h3v8H4z M17 13h3v8h-3z',
  sun: 'M12 3v2 M12 19v2 M3 12h2 M19 12h2 M5 5l2 2 M17 17l2 2 M19 5l-2 2 M7 17l-2 2 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  check: 'M5 12l4 4L19 6',
  arrow: 'M5 12h14 M14 7l5 5-5 5',
}
</script>
