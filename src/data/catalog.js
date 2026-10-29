export const photo = (id, width = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`

// Editorial entry points are labelled separately from live recommendations.
export const editorialPlaylists = [
  {
    id: 3778678,
    name: '热歌榜 · 此刻大家都在听',
    tag: '热门旋律',
    picUrl: photo('photo-1470252649378-9c29740c9fa8'),
  },
  {
    id: 19723756,
    name: '飙升榜 · 发现新的心动',
    tag: '新鲜心动',
    picUrl: photo('photo-1475924156734-496f6cac6ec1'),
  },
  {
    id: 2884035,
    name: '原创榜 · 听见独立的声音',
    tag: '独立之声',
    picUrl: photo('photo-1441974231531-c6227db76b6e'),
  },
  {
    id: 3779629,
    name: '新歌榜 · 邂逅全新旋律',
    tag: '音乐漫游',
    picUrl: photo('photo-1519608487953-e999c86e7455'),
  },
  {
    id: 60198,
    name: '美国 Billboard 榜',
    tag: '全球音乐',
    picUrl: photo('photo-1442512595331-e89e73853f31'),
  },
]

// Verified NetEase metadata; replaced by fresh song details on startup.
export const initialSongs = [
  {
    id: 139774,
    name: 'The truth that you leave',
    artist: 'Pianoboy高至豪',
    album: 'The truth that you leave',
    duration: 223.467,
    cover: 'https://p2.music.126.net/9idkdzbel_-lYBP7Dv_dVQ==/102254581395289.jpg',
  },
  {
    id: 167876,
    name: '有何不可',
    artist: '许嵩',
    album: '自定义',
    duration: 241.84,
    cover: 'https://p2.music.126.net/Zg4XDfsiRi5vawjSWPP8Ng==/109951172899966259.jpg',
  },
  {
    id: 28815250,
    name: '平凡之路',
    artist: '朴树',
    album: '猎户星座',
    duration: 302.119,
    cover: 'https://p2.music.126.net/W_5XiCv3rGS1-J7EXpHSCQ==/18885211718782327.jpg',
  },
  {
    id: 25706282,
    name: '夜空中最亮的星',
    artist: '逃跑计划',
    album: '世界',
    duration: 252.235,
    cover: 'https://p2.music.126.net/625-tE8OzdM-rWO37PgqlQ==/109951168111472442.jpg',
  },
  {
    id: 27678655,
    name: '李白',
    artist: '李荣浩',
    album: '模特',
    duration: 273.442,
    cover: 'https://p2.music.126.net/0uZ_bKtm4E188Uk9LFN1qg==/109951163187393370.jpg',
  },
]
