// Request a NetEase-compatible API; an empty base uses the bundled local proxy.
export async function request(path, params = {}) {
  const base = (
    localStorage.getItem('tingyu-api') ||
    import.meta.env.VITE_NETEASE_API ||
    '/api'
  ).replace(/\/$/, '')
  const response = await fetch(`${base}${path}?${new URLSearchParams(params)}`, {
    signal: AbortSignal.timeout(16000),
  })
  if (!response.ok) throw new Error('音乐服务暂时不可用，请稍后重试')
  const data = await response.json()
  if (data.code && data.code !== 200) throw new Error(data.message || '音乐服务返回异常')
  return data
}

// Normalize both official and community API track structures.
export function normalizeSong(song) {
  return {
    id: song.id,
    name: song.name || '未知歌曲',
    artist: (song.ar || song.artists || []).map((item) => item.name).join(' / '),
    album: (song.al || song.album)?.name || '未知专辑',
    cover: (song.al || song.album)?.picUrl || '',
    duration: (song.dt || song.duration || 0) / 1000,
    ...(song.fee !== undefined ? { fee: song.fee } : {}),
  }
}

// Use actual URL availability first; a VIP fee alone does not prove playback is blocked.
export function classifyAvailability(song, result) {
  if (song.localUrl) return { status: 'available', label: '', url: song.localUrl }
  if (!result) return { status: 'unknown', label: '权限未确认' }
  if (result.url) {
    return {
      status: result.freeTrialInfo ? 'preview' : 'available',
      label: result.freeTrialInfo ? '仅试听' : '',
      url: result.url,
    }
  }
  const fee = result.fee ?? song.fee
  if (
    result.code === 404 ||
    result.code === -200 ||
    result.freeTrialPrivilege?.cannotListenReason === 1
  ) {
    return { status: 'copyright', label: '版权受限' }
  }
  if ([1, 4].includes(fee)) return { status: 'vip', label: fee === 4 ? '付费歌曲' : '会员歌曲' }
  return { status: 'unavailable', label: '暂不可播放' }
}

// Expand multiple LRC timestamps and sort lyrics for precise playback syncing.
export function parseLyrics(lrc = '') {
  return lrc
    .split('\n')
    .flatMap((line) => {
      const content = line.replace(/\[[^\]]*\]/g, '').trim()
      return [...line.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)].map((match) => ({
        time: Number(match[1]) * 60 + Number(match[2]),
        text: content,
      }))
    })
    .filter((line) => line.text)
    .sort((a, b) => a.time - b.time)
}
