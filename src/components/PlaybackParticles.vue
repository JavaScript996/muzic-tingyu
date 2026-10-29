<template>
  <canvas ref="canvas" class="playback-particles" aria-hidden="true"></canvas>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  playing: Boolean,
  enabled: { type: Boolean, default: true },
  volume: { type: Number, default: 0.7 },
})
const canvas = ref(null)
const colors = ['59,130,246', '56,189,248', '96,165,250', '37,99,235']
let context,
  observer,
  motionPreference,
  frame = 0,
  lastTime = 0,
  elapsed = 0
let width = 0,
  height = 0,
  emission = 0,
  strength = 0,
  particles = []

// Match the responsive canvas backing buffer to the display pixel density.
function resize() {
  const bounds = canvas.value.getBoundingClientRect()
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  width = bounds.width
  height = bounds.height
  canvas.value.width = Math.round(width * scale)
  canvas.value.height = Math.round(height * scale)
  context.setTransform(scale, 0, 0, scale, 0, 0)
  if (!frame) context.clearRect(0, 0, width, height)
}

// Draw clear single and beamed eighth notes without relying on platform fonts.
function drawNote(particle, opacity) {
  context.save()
  context.translate(particle.x, particle.y)
  context.rotate(particle.rotation + particle.spin * particle.age)
  context.scale(particle.size / 14, particle.size / 14)
  context.fillStyle = `rgba(${particle.color},${opacity})`
  context.strokeStyle = `rgba(${particle.color},${opacity})`
  context.lineWidth = 1.6
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.shadowColor = `rgba(${particle.color},${opacity * 0.4})`
  context.shadowBlur = 5
  context.beginPath()
  context.ellipse(-3, 4, 3.3, 2.2, -0.35, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.moveTo(-0.3, 3.5)
  context.lineTo(-0.3, -10)
  if (particle.beamed) {
    context.lineTo(9, -13)
    context.lineTo(9, 0.5)
    context.stroke()
    context.beginPath()
    context.ellipse(6.3, 1, 3.3, 2.2, -0.35, 0, Math.PI * 2)
    context.fill()
    context.beginPath()
    context.moveTo(-0.3, -7)
    context.lineTo(9, -10)
  } else {
    context.bezierCurveTo(0, -6, 8, -7, 5, -1)
  }
  context.stroke()
  context.restore()
}

// Float blue musical notes with gentle swaying, following playback and volume.
function animate(timestamp) {
  frame = 0
  const delta = Math.min((timestamp - (lastTime || timestamp)) / 1000, 0.05)
  lastTime = timestamp
  elapsed += delta
  const active =
    props.playing &&
    props.enabled &&
    props.volume > 0 &&
    !motionPreference.matches &&
    !document.hidden
  const target = active ? Math.sqrt(Math.max(0, props.volume)) : 0
  strength += (target - strength) * Math.min(1, delta * 7)
  context.clearRect(0, 0, width, height)

  // Use spacious, readable notes with a few small blue glints instead of dense dots.
  if (active) {
    const beat = 0.7 + 0.3 * Math.pow(Math.sin(elapsed * 2.4), 2)
    emission += delta * 18 * strength * beat
    while (emission >= 1 && particles.length < 60) {
      emission--
      const isNote = Math.random() > 0.25
      particles.push({
        originX: width * (0.035 + Math.random() * 0.93),
        x: 0,
        y: height + 9,
        vx: (Math.random() - 0.5) * 9,
        vy: -(38 + Math.random() * 27) * (0.65 + strength * 0.35),
        age: 0,
        life: 1.7 + Math.random() * 0.8,
        size: isNote ? 9 + Math.random() * 6 : 1 + Math.random(),
        isNote,
        beamed: Math.random() > 0.6,
        phase: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.5,
        spin: (Math.random() - 0.5) * 0.22,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    emission = Math.min(emission, 1)
  }

  particles = particles.filter((particle) => particle.age < particle.life)
  for (const particle of particles) {
    particle.age += delta
    particle.x =
      particle.originX +
      particle.vx * particle.age +
      Math.sin(particle.age * 2 + particle.phase) * 7
    particle.y += particle.vy * delta
    particle.vy += 7 * delta
    const opacity = Math.max(0, Math.sin((particle.age / particle.life) * Math.PI)) * 0.7
    if (particle.isNote) drawNote(particle, opacity)
    else {
      context.fillStyle = `rgba(${particle.color},${opacity * 0.6})`
      context.beginPath()
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      context.fill()
    }
  }

  // Subtle flowing blue ribbons replace the old dotted equalizer.
  if (strength > 0.01) {
    for (let ribbon = 0; ribbon < 2; ribbon++) {
      context.beginPath()
      context.strokeStyle = `rgba(${colors[ribbon]},${0.13 * strength})`
      context.lineWidth = 1
      for (let x = 0; x <= width; x += 5) {
        const y = height - 6 - (Math.sin(x * 0.015 + elapsed * 1.4 + ribbon * 2) + 1) * 5 * strength
        if (x === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }
      context.stroke()
    }
  }
  if (active || particles.length || strength > 0.01) frame = requestAnimationFrame(animate)
  else {
    lastTime = 0
    strength = 0
    context.clearRect(0, 0, width, height)
  }
}

// Suspend rendering when hidden, disabled, or reduced motion is requested.
function refresh() {
  if (!context) return
  if (!props.enabled || motionPreference.matches || document.hidden) {
    cancelAnimationFrame(frame)
    frame = 0
    lastTime = 0
    strength = 0
    emission = 0
    particles = []
    context.clearRect(0, 0, width, height)
    return
  }
  if (!frame && (props.playing || particles.length)) frame = requestAnimationFrame(animate)
}

watch(() => [props.playing, props.enabled, props.volume], refresh)

onMounted(() => {
  context = canvas.value.getContext('2d')
  if (!context) return
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', refresh)
  document.addEventListener('visibilitychange', refresh)
  observer = new ResizeObserver(resize)
  observer.observe(canvas.value)
  resize()
  refresh()
})

onUnmounted(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  motionPreference?.removeEventListener('change', refresh)
  document.removeEventListener('visibilitychange', refresh)
})
</script>

<style scoped lang="scss">
.playback-particles {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
