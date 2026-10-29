<template>
  <div class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="#" aria-label="听屿首页" @click.prevent="navigate('discover')"
        ><span class="brand__mark"><Icon name="music" :size="25" /></span
        ><span>听屿<span class="brand__en">TINGYU</span></span></a
      >
      <div class="sidebar__label">在线音乐</div>
      <nav class="nav-list" aria-label="音乐导航">
        <button
          v-for="item in navigation"
          :key="item.id"
          :aria-label="item.label"
          :class="['nav-item', { 'is-active': page === item.id }]"
          @click="navigate(item.id)"
        >
          <Icon :name="item.icon" /><span>{{ item.label }}</span
          ><span v-if="item.id === 'discover'" class="nav-dot"></span>
        </button>
      </nav>
      <div class="sidebar__label library-label">我的音乐</div>
      <nav class="nav-list" aria-label="我的音乐">
        <button
          :class="['nav-item', { 'is-active': page === 'favorites' }]"
          aria-label="我喜欢的音乐"
          @click="navigate('favorites')"
        >
          <Icon name="heart" /><span>我喜欢的音乐</span><small>{{ favorites.length || '' }}</small>
        </button>
        <button
          :class="['nav-item', { 'is-active': page === 'recent' }]"
          aria-label="最近播放"
          @click="navigate('recent')"
        >
          <Icon name="clock" /><span>最近播放</span>
        </button>
        <button
          :class="['nav-item', { 'is-active': page === 'local' }]"
          aria-label="本地音乐"
          @click="navigate('local')"
        >
          <Icon name="folder" /><span>本地音乐</span>
        </button>
      </nav>
      <div class="sidebar__label playlist-label">
        创建的歌单<button title="创建歌单" @click="newPlaylistOpen = true">
          <Icon name="plus" :size="16" />
        </button>
      </div>
      <button
        v-for="list in userPlaylists"
        :key="list.id"
        class="nav-item user-list"
        :aria-label="list.name"
        :title="list.name"
        @click="openUserPlaylist(list)"
      >
        <span class="playlist-mini"><Icon name="music" :size="15" /></span
        ><span>{{ list.name }}</span>
      </button>
      <div class="sidebar__bottom">
        <div class="listen-note">
          <span>让音乐，陪你慢一点。</span>
          <div class="sound-bars"><i v-for="n in 14" :key="n"></i></div>
        </div>
        <button class="nav-item" @click="openSettings">
          <Icon name="settings" :size="18" />设置与 API
        </button>
      </div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <div class="history-buttons">
          <button class="icon-button" title="返回发现" @click="navigate('discover')">
            <Icon name="left" :size="19" /></button
          ><span class="history-divider"></span><span class="page-breadcrumb">{{ pageTitle }}</span>
        </div>
        <form class="search" @submit.prevent="searchMusic">
          <Icon name="search" :size="18" /><input
            v-model="query"
            placeholder="搜索音乐、歌手、专辑"
            aria-label="搜索音乐、歌手、专辑"
          /><kbd>↵</kbd>
        </form>
        <div class="topbar__actions">
          <span
            class="service-dot"
            :class="{ 'is-online': liveData }"
            :title="liveData ? '网易云数据已连接' : '等待网易云数据'"
          ></span
          ><button class="icon-button" title="服务设置" @click="openSettings">
            <Icon name="settings" :size="19" /></button
          ><span class="topbar__divider"></span
          ><button class="profile" @click="notify('欢迎来到听屿，收藏与歌单会保存在当前设备。')">
            <span>听</span><span class="profile__name">音乐旅人</span>
          </button>
        </div>
      </header>
      <main class="main-content">
        <template v-if="page === 'discover'">
          <div class="page-heading">
            <div>
              <p class="eyebrow">YOUR DAILY SOUNDTRACK</p>
              <h1>发现你的音乐<span>。</span></h1>
              <p class="heading-description">熟悉的旋律，未曾遇见的惊喜。今天，也有好音乐陪你。</p>
            </div>
            <div class="date-badge">
              <Icon name="sun" :size="17" /><span
                >{{ dateLabel }}<small>宜 · 听点喜欢的</small></span
              >
            </div>
          </div>
          <section
            class="hero"
            :style="{
              backgroundImage: `linear-gradient(90deg, rgba(14,38,39,.84), rgba(14,38,39,.09)), url(${photo(heroSlide.image, 1600)})`,
            }"
          >
            <div class="hero__content">
              <span class="hero__badge"><span></span> 编辑精选 · 每日灵感</span>
              <p class="hero__eyebrow">{{ heroSlide.eyebrow }}</p>
              <h2>{{ heroSlide.title }}<br />{{ heroSlide.subtitle }}</h2>
              <p class="hero__description">{{ heroSlide.description }}</p>
              <div class="hero__actions">
                <button class="button button--white" @click="playAll(songs)">
                  <Icon name="play" :size="17" />即刻聆听</button
                ><span>放松心绪 · 治愈耳朵</span>
              </div>
            </div>
            <span class="hero__index">0{{ heroIndex + 1 }} <span>/ 03</span></span>
            <div class="hero__dots">
              <button
                v-for="(slide, index) in heroSlides"
                :key="slide.eyebrow"
                :class="{ active: index === heroIndex }"
                :aria-label="`切换推荐 ${index + 1}`"
                :aria-pressed="heroIndex === index"
                @click="heroIndex = index"
              ></button>
            </div>
            <span class="hero__vertical">MUSIC IS YOUR LITTLE ESCAPE</span>
          </section>
          <section class="recommendations">
            <div class="section-heading">
              <h2>为你推荐<span>为每一种心情，找到共鸣</span></h2>
              <button class="text-button" @click="navigate('playlists')">
                查看全部<Icon name="right" :size="16" />
              </button>
            </div>
            <div class="playlist-grid">
              <button
                v-for="(list, index) in playlists.slice(0, 5)"
                :key="list.id"
                class="playlist-card"
                @click="openPlaylist(list)"
              >
                <div class="playlist-card__art">
                  <img
                    :src="list.picUrl"
                    :alt="list.name"
                    :style="{
                      backgroundColor: ['#b4c7b3', '#d3bbb0', '#8c9f89', '#b2a6b9', '#a79584'][
                        index
                      ],
                    }"
                    loading="lazy"
                  /><span v-if="list.playCount" class="playlist-card__count"
                    ><Icon name="headphones" :size="12" />{{ countLabel(list.playCount) }}</span
                  ><span class="playlist-card__play"><Icon name="play" :size="20" /></span
                  ><span class="playlist-card__tag">{{
                    list.tag || ['精选推荐', '随心而听', '心动旋律', '音乐漫游', '发现好歌'][index]
                  }}</span>
                </div>
                <h3>{{ list.name }}</h3>
                <p>{{ livePlaylists ? '网易云音乐 · 精选歌单' : '听屿编辑精选' }}</p>
              </button>
            </div>
          </section>
          <div class="discovery-bottom">
            <section class="daily-tracks">
              <div class="section-heading">
                <h2>今日好歌<span>新的一天，从一首歌开始</span></h2>
                <button class="text-button" @click="playAll(songs)">
                  <Icon name="play" :size="14" />播放全部
                </button>
              </div>
              <div class="compact-tracks">
                <div
                  v-for="(song, index) in songs.slice(0, 4)"
                  :key="song.id"
                  :class="['compact-track', { 'is-unavailable': !canPlaySong(song) }]"
                >
                  <button
                    class="compact-track__main"
                    :disabled="!canPlaySong(song)"
                    :title="songState(song).label"
                    @click="playSong(song, songs)"
                  >
                    <span
                      class="track-number"
                      :class="{ 'is-playing': currentSong?.id === song.id }"
                      >{{
                        currentSong?.id === song.id && playing
                          ? 'ılı'
                          : String(index + 1).padStart(2, '0')
                      }}</span
                    >
                    <img :src="song.cover || fallbackCover" alt="" />
                    <span class="track-meta"
                      ><strong
                        ><span class="song-title-text">{{ song.name }}</span
                        ><SongAvailability :state="songState(song)" /></strong
                      ><small>{{ song.artist }}</small></span
                    >
                    <span class="compact-track__album">{{ song.album }}</span
                    ><span class="track-duration">{{ formatTime(song.duration) }}</span>
                  </button>
                  <button
                    :aria-label="isFavorite(song) ? '取消收藏' : '收藏歌曲'"
                    :class="['favorite-icon', { 'is-favorite': isFavorite(song) }]"
                    @click="toggleFavorite(song)"
                  >
                    <Icon name="heart" :size="17" />
                  </button>
                  <DownloadButton
                    :song="song"
                    :state="songState(song)"
                    :active-id="downloadingId"
                    @download="downloadSong"
                  />
                </div>
              </div>
            </section>
            <section class="daily-card">
              <div>
                <span class="daily-card__eyebrow">DAILY MIX</span><Icon name="radio" :size="23" />
              </div>
              <h3>你的私人音乐角落</h3>
              <p>不设定目的地<br />下一首，或许就是心动。</p>
              <button @click="startRadio">开启私人漫游<Icon name="arrow" :size="17" /></button
              ><span class="daily-card__circle"></span>
            </section>
          </div>
          <div class="page-footer">
            <span><span class="footer-dot"></span>音乐让日常，变得不平常。</span
            ><span>POWERED BY NETEASE CLOUD MUSIC</span>
          </div>
        </template>
        <template v-else>
          <div class="page-heading">
            <div>
              <p class="eyebrow">
                {{ page === 'search' ? 'FIND YOUR NEXT FAVORITE' : 'YOUR MUSIC, YOUR MOMENT' }}
              </p>
              <h1>{{ pageTitle }}<span>。</span></h1>
              <p class="heading-description">{{ pageDescription }}</p>
            </div>
            <button
              v-if="page === 'local'"
              class="button button--primary"
              @click="fileInput.click()"
            >
              <Icon name="plus" :size="17" />导入音乐</button
            ><button
              v-else-if="displaySongs.length"
              class="button button--primary"
              @click="playAll(displaySongs)"
            >
              <Icon name="play" :size="17" />播放全部
            </button>
          </div>
          <div v-if="busy" class="loading-state"><span class="spinner"></span>正在寻找好音乐…</div>
          <div v-else-if="pageError" class="empty-state">
            <Icon name="radio" :size="42" />
            <h3>暂时没有连接到音乐服务</h3>
            <p>{{ pageError }}</p>
            <button class="button button--primary" @click="retryPage">重新加载</button
            ><button class="text-button" @click="openSettings">配置 API 服务</button>
          </div>
          <div
            v-else-if="page === 'playlists' || page === 'charts'"
            class="playlist-grid playlist-grid--all"
          >
            <button
              v-for="list in page === 'charts' ? charts : playlists"
              :key="list.id"
              class="playlist-card"
              @click="openPlaylist(list)"
            >
              <div class="playlist-card__art">
                <img :src="list.picUrl || list.coverImgUrl" :alt="list.name" /><span
                  class="playlist-card__play"
                  ><Icon name="play"
                /></span>
              </div>
              <h3>{{ list.name }}</h3>
              <p>{{ list.description?.slice(0, 38) || '网易云音乐 · 用音乐记录生活' }}</p>
            </button>
          </div>
          <template v-else-if="displaySongs.length"
            ><div class="song-table">
              <div class="song-table__header">
                <span>#</span><span>歌曲 / 歌手</span><span>专辑</span><span>时长</span
                ><span></span>
              </div>
              <div
                v-for="(song, index) in displaySongs"
                :key="song.id"
                :class="[
                  'song-row',
                  {
                    'is-current': currentSong?.id === song.id,
                    'is-unavailable': !canPlaySong(song),
                  },
                ]"
                @dblclick="playSong(song, displaySongs)"
              >
                <button
                  class="track-number"
                  :aria-label="`播放 ${song.name}`"
                  :disabled="!canPlaySong(song)"
                  @click="playSong(song, displaySongs)"
                >
                  {{
                    currentSong?.id === song.id && playing
                      ? 'ılı'
                      : String(index + 1).padStart(2, '0')
                  }}</button
                ><button
                  class="song-row__title"
                  :disabled="!canPlaySong(song)"
                  @click="playSong(song, displaySongs)"
                >
                  <img :src="song.cover || fallbackCover" alt="" /><span class="track-meta"
                    ><strong
                      ><span class="song-title-text">{{ song.name }}</span
                      ><SongAvailability :state="songState(song)" /></strong
                    ><small>{{ song.artist }}</small></span
                  ></button
                ><span class="song-row__album">{{ song.album }}</span
                ><span class="track-duration">{{ formatTime(song.duration) }}</span>
                <div class="song-row__actions">
                  <button
                    :class="['icon-button', { 'is-favorite': isFavorite(song) }]"
                    title="收藏"
                    @click="toggleFavorite(song)"
                  >
                    <Icon name="heart" :size="17" /></button
                  ><button class="icon-button" title="加入歌单" @click="songToAdd = song">
                    <Icon name="plus" :size="18" />
                  </button>
                  <DownloadButton
                    :song="song"
                    :state="songState(song)"
                    :active-id="downloadingId"
                    @download="downloadSong"
                  />
                </div>
              </div></div
          ></template>
          <div v-else class="empty-state">
            <Icon :name="page === 'favorites' ? 'heart' : 'music'" :size="44" />
            <h3>{{ page === 'search' ? '没有找到相关歌曲' : '把喜欢的音乐留在这里' }}</h3>
            <p>
              {{
                page === 'local'
                  ? '支持 MP3、WAV、OGG 等浏览器可播放的音频文件'
                  : '去发现一首好歌，让音乐陪你度过每一天。'
              }}
            </p>
            <button
              v-if="page !== 'search'"
              class="button button--primary"
              @click="page === 'local' ? fileInput.click() : navigate('discover')"
            >
              {{ page === 'local' ? '选择本地音乐' : '发现音乐' }}
            </button>
          </div>
        </template>
      </main>
    </div>
    <footer class="player">
      <PlaybackParticles :playing="playing" :enabled="particlesEnabled" :volume="volume" />
      <div class="player__song">
        <button
          class="player__cover"
          title="打开歌词"
          @click="drawer = drawer === 'lyrics' ? '' : 'lyrics'"
        >
          <img :src="currentSong?.cover || fallbackCover" alt="当前歌曲封面" /><span
            ><Icon name="expand" :size="17"
          /></span>
        </button>
        <div class="track-meta">
          <strong>{{ currentSong?.name || '听见生活的美好' }}</strong
          ><small>{{ currentSong?.artist || '选择一首音乐，开始聆听' }}</small>
        </div>
        <button
          :class="['icon-button', { 'is-favorite': currentSong && isFavorite(currentSong) }]"
          title="喜欢当前歌曲"
          @click="currentSong && toggleFavorite(currentSong)"
        >
          <Icon name="heart" :size="19" />
        </button>
        <DownloadButton
          :song="currentSong"
          :state="currentSong ? songState(currentSong) : { status: 'unknown' }"
          :active-id="downloadingId"
          @download="downloadSong"
        />
      </div>
      <div class="player__center">
        <div class="player__controls">
          <button
            :class="['icon-button', { 'is-accent': mode === 'shuffle' }]"
            :title="`播放模式：${modeLabels[mode]}，点击切换`"
            @click="cycleMode"
          >
            <Icon :name="mode === 'shuffle' ? 'shuffle' : 'repeat'" :size="18" /><sup
              v-if="mode === 'one'"
              >1</sup
            ></button
          ><button class="icon-button" title="上一首" @click="skip(-1)">
            <Icon name="previous" :size="20" /></button
          ><button
            class="play-button"
            :aria-label="playing ? '暂停' : '播放'"
            :disabled="audioLoading"
            @click="togglePlay"
          >
            <span v-if="audioLoading" class="spinner spinner--light"></span
            ><Icon v-else :name="playing ? 'pause' : 'play'" :size="21" /></button
          ><button class="icon-button" title="下一首" @click="skip(1)">
            <Icon name="next" :size="20" /></button
          ><button
            :class="['lyric-button', { 'is-accent': drawer === 'lyrics' }]"
            title="滚动歌词"
            @click="drawer = drawer === 'lyrics' ? '' : 'lyrics'"
          >
            词
          </button>
          <button
            :class="['icon-button', 'particle-toggle', { 'is-accent': particlesEnabled }]"
            :title="particlesEnabled ? '关闭蓝色音符特效' : '开启蓝色音符特效'"
            :aria-label="particlesEnabled ? '关闭蓝色音符特效' : '开启蓝色音符特效'"
            :aria-pressed="particlesEnabled"
            @click="particlesEnabled = !particlesEnabled"
          >
            <Icon name="music" :size="17" />
          </button>
        </div>
        <div class="player__progress">
          <span>{{ formatTime(currentTime) }}</span
          ><input
            type="range"
            min="0"
            :max="duration || 1"
            :value="currentTime"
            :style="{ '--progress': `${duration ? (currentTime / duration) * 100 : 0}%` }"
            aria-label="播放进度"
            @input="seek(Number($event.target.value))"
          /><span>{{ formatTime(duration) }}</span>
        </div>
      </div>
      <div class="player__extras">
        <span class="audio-quality">标准音质</span
        ><button
          class="icon-button"
          :title="volume ? '静音' : '取消静音'"
          @click="volume = volume ? 0 : 0.7"
        >
          <Icon :name="volume ? 'volume' : 'mute'" :size="19" /></button
        ><input
          v-model.number="volume"
          class="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          aria-label="音量"
          :style="{ '--progress': `${volume * 100}%` }"
        /><span class="player__divider"></span
        ><button
          :class="['icon-button queue-button', { 'is-accent': drawer === 'queue' }]"
          title="播放队列"
          @click="drawer = drawer === 'queue' ? '' : 'queue'"
        >
          <Icon name="queue" :size="21" /><small>{{ queue.length }}</small>
        </button>
      </div>
    </footer>
    <Transition name="drawer"
      ><aside v-if="drawer" class="drawer-panel">
        <div class="drawer-panel__heading">
          <h2>
            {{ drawer === 'lyrics' ? '正在播放' : '播放队列'
            }}<small v-if="drawer === 'queue'">{{ queue.length }} 首</small>
          </h2>
          <button class="icon-button" title="关闭" @click="drawer = ''">
            <Icon name="close" />
          </button>
        </div>
        <template v-if="drawer === 'lyrics'"
          ><div class="lyrics-song">
            <img :src="currentSong?.cover || fallbackCover" alt="专辑封面" />
            <h3>{{ currentSong?.name || '等待一首好歌' }}</h3>
            <p>{{ currentSong?.artist || '让音乐走进你的生活' }}</p>
          </div>
          <div ref="lyricsContainer" class="lyrics">
            <p v-if="lyricsLoading" class="lyrics__empty">正在加载歌词…</p>
            <template v-else-if="lyrics.length"
              ><button
                v-for="(line, index) in lyrics"
                :key="`${line.time}-${index}`"
                :class="['lyrics__line', { 'is-active': index === activeLyric }]"
                @click="seek(line.time)"
              >
                {{ line.text }}
              </button></template
            >
            <p v-else class="lyrics__empty">{{ lyricMessage }}</p>
          </div></template
        ><template v-else
          ><div class="queue-actions">
            <span>让喜欢的旋律，继续播放</span
            ><button class="text-button" @click="clearQueue">清空队列</button>
          </div>
          <div class="queue-list">
            <div
              v-for="song in queue"
              :key="song.id"
              :class="['queue-track', { 'is-current': currentSong?.id === song.id }]"
            >
              <button :disabled="!canPlaySong(song)" @click="playSong(song)">
                <img :src="song.cover || fallbackCover" alt="" /><span class="track-meta"
                  ><strong
                    ><span class="song-title-text">{{ song.name }}</span
                    ><SongAvailability :state="songState(song)" /></strong
                  ><small>{{ song.artist }}</small></span
                ></button
              ><button
                class="icon-button"
                :title="`从队列移除 ${song.name}`"
                @click="queue = queue.filter((item) => item.id !== song.id)"
              >
                <Icon name="close" :size="15" />
              </button>
            </div>
            <p v-if="!queue.length" class="lyrics__empty">队列空空的，去发现喜欢的音乐吧。</p>
          </div></template
        >
      </aside></Transition
    >
    <div
      v-if="settingsOpen || newPlaylistOpen || songToAdd"
      class="modal-backdrop"
      @click.self="closeModals"
    >
      <section
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-label="settingsOpen ? '音乐服务设置' : '歌单设置'"
      >
        <button class="modal__close icon-button" title="关闭弹窗" @click="closeModals">
          <Icon name="close" /></button
        ><template v-if="settingsOpen"
          ><span class="modal__icon"><Icon name="settings" :size="27" /></span>
          <h2>音乐服务设置</h2>
          <p>默认使用内置网易云数据代理。也可以连接自己部署的 NeteaseCloudMusicApi 服务。</p>
          <form @submit.prevent="saveSettings">
            <label for="api-base">API 服务地址</label
            ><input
              id="api-base"
              v-model="apiInput"
              class="form-input"
              placeholder="留空使用内置服务，或 https://your-api.com"
              type="url"
            /><small class="field-help"
              >外部服务需要允许跨域。歌曲播放受地区、版权及会员权限限制。</small
            ><button class="button button--primary" type="submit">
              保存并连接<Icon name="arrow" :size="17" />
            </button></form></template
        ><template v-else-if="newPlaylistOpen"
          ><h2>创建你的歌单</h2>
          <p>为生活里的某个瞬间，留下一组旋律。</p>
          <form @submit.prevent="createPlaylist">
            <label for="playlist-name">歌单名称</label
            ><input
              id="playlist-name"
              v-model="playlistName"
              class="form-input"
              placeholder="例如：下班路上的歌"
              maxlength="30"
              required
            /><button type="submit" class="button button--primary">
              创建歌单<Icon name="plus" :size="17" />
            </button></form></template
        ><template v-else
          ><h2>添加到歌单</h2>
          <p>{{ songToAdd?.name }} · {{ songToAdd?.artist }}</p>
          <button
            v-for="list in userPlaylists"
            :key="list.id"
            class="add-playlist-item"
            @click="addToPlaylist(list)"
          >
            <Icon name="folder" />{{ list.name }}<Icon name="plus" :size="16" /></button
          ><button class="text-button" @click="beginNewPlaylist">创建新歌单</button></template
        >
      </section>
    </div>
    <Transition name="toast"
      ><div v-if="toastMessage" class="toast-message" role="status">
        <Icon name="music" :size="17" />{{ toastMessage }}
      </div></Transition
    >
    <audio
      ref="audio"
      preload="metadata"
      @timeupdate="currentTime = audio.currentTime"
      @loadedmetadata="duration = Number.isFinite(audio.duration) ? audio.duration : 0"
      @play="playing = true"
      @pause="playing = false"
      @ended="handleEnded"
      @error="handleAudioError"
    ></audio>
    <input ref="fileInput" type="file" accept="audio/*" multiple hidden @change="importFiles" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import Icon from './components/AppIcon.vue'
import PlaybackParticles from './components/PlaybackParticles.vue'
import { request, normalizeSong, parseLyrics, classifyAvailability } from './services/music'
import SongAvailability from './components/SongAvailability.vue'
import DownloadButton from './components/DownloadButton.vue'
import { editorialPlaylists, initialSongs, photo } from './data/catalog'

// Restore array-shaped device library state, tolerating invalid storage.
function readStored(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return Array.isArray(value) ? value : fallback
  } catch {
    return fallback
  }
}

const page = ref('discover'),
  query = ref(''),
  songs = ref(initialSongs),
  playlists = ref(editorialPlaylists),
  charts = ref([])
const particlesEnabled = ref(localStorage.getItem('tingyu-particles') !== 'false')
const availability = ref({})
const downloadingId = ref(null)
const availabilityRequests = new Map()
let availabilityGeneration = 0
const searchResults = ref([]),
  playlistSongs = ref([]),
  selectedPlaylist = ref(null),
  localSongs = ref([])
const favorites = ref(readStored('tingyu-favorites', [])),
  recent = ref(readStored('tingyu-recent', []))
const userPlaylists = ref(
  readStored('tingyu-playlists', [
    { id: 'my-first', name: '日常听听', songs: [] },
    { id: 'my-night', name: '深夜留声机', songs: [] },
  ]),
)
const liveData = ref(false),
  livePlaylists = ref(false),
  busy = ref(false),
  pageError = ref('')
const audio = ref(null),
  currentSong = ref(null),
  playing = ref(false),
  audioLoading = ref(false),
  queue = ref([])
const currentTime = ref(0),
  duration = ref(0),
  volume = ref(0.7),
  mode = ref('list'),
  drawer = ref('')
const lyrics = ref([]),
  lyricsLoading = ref(false),
  lyricMessage = ref('播放歌曲后，在这里查看滚动歌词'),
  lyricsContainer = ref(null)
const settingsOpen = ref(false),
  apiInput = ref(''),
  newPlaylistOpen = ref(false),
  playlistName = ref(''),
  songToAdd = ref(null),
  fileInput = ref(null)
const toastMessage = ref(''),
  fallbackCover = photo('photo-1470225620780-dba8ba36b745', 200)
const modeLabels = { list: '列表循环', one: '单曲循环', shuffle: '随机播放' }
const navigation = [
  { id: 'discover', label: '发现音乐', icon: 'discover' },
  { id: 'playlists', label: '精选歌单', icon: 'music' },
  { id: 'radio', label: '私人漫游', icon: 'radio' },
  { id: 'charts', label: '排行榜', icon: 'chart' },
]
const heroSlides = [
  {
    image: 'photo-1472396961693-142e6e269027',
    eyebrow: 'A LITTLE ESCAPE',
    title: '把世界调成静音',
    subtitle: '把音乐，留给自己。',
    description: '走进旋律里的旷野，让每一个音符，带你自由呼吸。',
  },
  {
    image: 'photo-1475924156734-496f6cac6ec1',
    eyebrow: 'SLOW DOWN A LITTLE',
    title: '让晚风慢一点',
    subtitle: '让旋律，再久一点。',
    description: '把日常的忙碌放在身后，在音乐里遇见一场日落。',
  },
  {
    image: 'photo-1519608487953-e999c86e7455',
    eyebrow: 'STAY WITH THE STARS',
    title: '在安静的夜里',
    subtitle: '听见心里的声音。',
    description: '总有一首歌，懂你未说出口的心事。',
  },
]
const heroIndex = ref(0)
const heroSlide = computed(() => heroSlides[heroIndex.value])
const dateLabel = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  timeZone: 'Asia/Shanghai',
}).format(new Date())
let toastTimer,
  pageRequest = 0,
  songRequest = 0,
  mounted = true
let homeRequest = 0
const objectUrls = []
const submittedQuery = ref('')
const pageTitle = computed(
  () =>
    ({
      discover: '发现音乐',
      playlists: '精选歌单',
      charts: '音乐排行榜',
      favorites: '我喜欢的音乐',
      recent: '最近播放',
      local: '本地音乐',
      search: `“${submittedQuery.value}” 的搜索结果`,
      playlist: selectedPlaylist.value?.name || '我的歌单',
    })[page.value] || '发现音乐',
)
const pageDescription = computed(
  () =>
    ({
      playlists: '每一份歌单，都是一个值得停留的世界。',
      charts: '此刻大家正在听的好音乐。',
      favorites: `${favorites.value.length} 首喜欢，把心动的瞬间好好收藏。`,
      recent: '那些陪伴过你的旋律，值得再次相遇。',
      local: '你的私人音乐收藏，仅在当前浏览器播放。',
      search: `找到 ${searchResults.value.length} 首歌曲，点击歌曲开始播放。`,
      playlist:
        selectedPlaylist.value?.description || `${playlistSongs.value.length} 首歌，装下你的日常。`,
    })[page.value],
)
const displaySongs = computed(
  () =>
    ({
      search: searchResults.value,
      favorites: favorites.value,
      recent: recent.value,
      local: localSongs.value,
      playlist: playlistSongs.value,
    })[page.value] || [],
)
const activeLyric = computed(() => {
  let found = -1
  for (let index = 0; index < lyrics.value.length; index++) {
    if (lyrics.value[index].time <= currentTime.value) found = index
    else break
  }
  return found
})

// Format media duration in seconds.
function formatTime(seconds = 0) {
  const safe = Number.isFinite(seconds) ? Math.floor(seconds) : 0
  return `${Math.floor(safe / 60)
    .toString()
    .padStart(2, '0')}:${(safe % 60).toString().padStart(2, '0')}`
}

// Format playlist popularity into a compact label.
function countLabel(count = 0) {
  return count >= 10000 ? `${(count / 10000).toFixed(1)}万` : String(count)
}

// Show a brief non-blocking status message.
function notify(message) {
  toastMessage.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 4500)
}

// Load recommendations and track metadata independently.
async function loadHome() {
  const token = ++homeRequest
  const results = await Promise.allSettled([
    request('/personalized', { limit: 10 }),
    request('/song/detail', { ids: initialSongs.map((song) => song.id).join(',') }),
  ])
  if (!mounted || token !== homeRequest) return
  const [lists, tracks] = results
  if (lists.status === 'fulfilled' && lists.value.result?.length) {
    playlists.value = lists.value.result
    livePlaylists.value = true
    liveData.value = true
  }
  if (tracks.status === 'fulfilled' && tracks.value.songs?.length) {
    songs.value = tracks.value.songs.map(normalizeSong)
    liveData.value = true
  }
  if (!liveData.value) notify('网易云连接暂不可用，正在展示编辑精选；可在设置中连接 API。')
}

// Navigate library views, discarding stale asynchronous page requests.
async function navigate(target) {
  pageRequest++
  busy.value = false
  pageError.value = ''
  page.value = target
  if (target === 'radio') {
    page.value = 'discover'
    startRadio()
    return
  }
  if (target === 'charts' && !charts.value.length) {
    const token = ++pageRequest
    busy.value = true
    try {
      const data = await request('/toplist')
      if (token === pageRequest) charts.value = data.list || []
    } catch (error) {
      if (token === pageRequest) pageError.value = error.message
    } finally {
      if (token === pageRequest) busy.value = false
    }
  }
}

// Search songs, ignoring responses superseded by a newer search or navigation.
async function searchMusic() {
  if (!query.value.trim()) return
  submittedQuery.value = query.value.trim()
  page.value = 'search'
  busy.value = true
  pageError.value = ''
  searchResults.value = []
  const token = ++pageRequest
  try {
    const data = await request('/cloudsearch', { keywords: submittedQuery.value, limit: 50 })
    if (token === pageRequest) {
      searchResults.value = (data.result?.songs || []).map(normalizeSong)
      liveData.value = true
      const ids = searchResults.value.map((song) => song.id).join(',')
      if (ids) {
        try {
          const details = await request('/song/detail', { ids })
          if (token === pageRequest && details.songs?.length) {
            const byId = new Map(details.songs.map((song) => [song.id, normalizeSong(song)]))
            searchResults.value = searchResults.value.map((song) => byId.get(song.id) || song)
          }
        } catch {
          /* Search results remain usable if artwork enrichment is unavailable. */
        }
      }
    }
  } catch (error) {
    if (token === pageRequest) pageError.value = error.message
  } finally {
    if (token === pageRequest) busy.value = false
  }
}

// Load the real tracks of an online playlist.
async function openPlaylist(list) {
  selectedPlaylist.value = list
  page.value = 'playlist'
  playlistSongs.value = []
  busy.value = true
  pageError.value = ''
  const token = ++pageRequest
  try {
    const data = await request('/playlist/detail', { id: list.id })
    if (token === pageRequest) {
      playlistSongs.value = (data.playlist?.tracks || data.result?.tracks || []).map(normalizeSong)
      liveData.value = true
    }
  } catch (error) {
    if (token === pageRequest) pageError.value = error.message
  } finally {
    if (token === pageRequest) busy.value = false
  }
}

// Retry the request associated with the current view.
function retryPage() {
  if (page.value === 'search') searchMusic()
  else if (page.value === 'playlist') openPlaylist(selectedPlaylist.value)
  else navigate(page.value)
}

// Read a shared per-song status so every library view shows the same restrictions.
async function downloadSong(song) {
  if (downloadingId.value || song.localUrl || songState(song).status !== 'available') return
  downloadingId.value = song.id
  notify('正在准备下载，请稍候…')
  try {
    if (window.tingyuDesktop?.downloadSong) {
      const result = await window.tingyuDesktop.downloadSong(song.id)
      if (result.status === 'saved') notify(`下载完成：${result.filename}`)
      else if (result.status === 'error') notify(result.message || '下载失败，请重试')
      else notify('已取消下载')
    } else {
      const response = await fetch(`/api/download?id=${encodeURIComponent(song.id)}`, {
        signal: AbortSignal.timeout(180000),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || '下载失败，请使用桌面版或内置代理服务')
      }
      if (!/^(audio\/|application\/octet-stream)/i.test(response.headers.get('content-type') || ''))
        throw new Error('当前部署不支持下载，请使用桌面版或内置代理服务')
      const blob = await response.blob()
      const name = response.headers
        .get('content-disposition')
        ?.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = name ? decodeURIComponent(name) : `歌曲-${song.id}.mp3`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60000)
      notify('音频已准备好，请在浏览器下载中查看保存结果')
    }
  } catch (error) {
    notify(
      error.name === 'TimeoutError' ? '下载超时，请稍后重试' : error.message || '下载失败，请重试',
    )
  } finally {
    downloadingId.value = null
  }
}

// Read a shared per-song status so every library view shows the same restrictions.
function songState(song) {
  if (song.localUrl) return { status: 'available', label: '', url: song.localUrl }
  return availability.value[song.id] || { status: 'checking', label: '检测中' }
}

// Allow unconfirmed tracks to retry, but never start a known restricted track.
function canPlaySong(song) {
  return ['available', 'preview', 'unknown'].includes(songState(song).status)
}

// Batch URL checks before interaction, deduplicating requests and expiring stale permissions.
async function checkSongAvailability(list) {
  const now = Date.now(),
    generation = availabilityGeneration
  const unique = [
    ...new Map(list.filter((song) => !song.localUrl).map((song) => [song.id, song])).values(),
  ]
  const waiting = [],
    needed = []
  for (const song of unique) {
    const pending = availabilityRequests.get(song.id)
    if (pending) {
      waiting.push(pending)
      continue
    }
    const state = availability.value[song.id]
    const ttl = state?.status === 'unknown' ? 30000 : 300000
    if (state?.checkedAt && now - state.checkedAt < ttl) continue
    availability.value[song.id] = { status: 'checking', label: '检测中' }
    needed.push(song)
  }
  for (let offset = 0; offset < needed.length; offset += 50) {
    const batch = needed.slice(offset, offset + 50)
    const pending = request('/song/url/v1', {
      id: batch.map((song) => song.id).join(','),
      level: 'standard',
    })
      .then((data) => {
        if (generation !== availabilityGeneration || !mounted) return
        const results = new Map((data.data || []).map((result) => [String(result.id), result]))
        for (const song of batch)
          availability.value[song.id] = {
            ...classifyAvailability(song, results.get(String(song.id))),
            checkedAt: Date.now(),
          }
      })
      .catch(() => {
        if (generation !== availabilityGeneration || !mounted) return
        for (const song of batch)
          availability.value[song.id] = {
            status: 'unknown',
            label: '权限未确认',
            checkedAt: Date.now(),
          }
      })
      .finally(() => {
        for (const song of batch)
          if (availabilityRequests.get(song.id) === pending) availabilityRequests.delete(song.id)
      })
    for (const song of batch) availabilityRequests.set(song.id, pending)
    waiting.push(pending)
  }
  await Promise.all(waiting)
}

// Play real audio and retrieve timestamped lyrics independently.
async function playSong(song, list) {
  const token = ++songRequest
  await checkSongAvailability([song])
  if (token !== songRequest || !canPlaySong(song)) return
  if (list) queue.value = [...list]
  if (!queue.value.some((item) => item.id === song.id)) queue.value.push(song)
  audio.value.pause()
  audio.value.removeAttribute('src')
  audio.value.load()
  currentSong.value = song
  currentTime.value = 0
  duration.value = song.duration
  audioLoading.value = true
  lyrics.value = []
  lyricsLoading.value = true
  lyricMessage.value = '暂无歌词，静静欣赏音乐吧'
  if (song.localUrl) {
    lyricsLoading.value = false
    lyricMessage.value = '本地音乐暂未提供歌词'
  } else
    request('/lyric', { id: song.id })
      .then((data) => {
        if (token === songRequest) lyrics.value = parseLyrics(data.lrc?.lyric)
      })
      .catch(() => {
        if (token === songRequest) lyricMessage.value = '歌词暂时无法加载'
      })
      .finally(() => {
        if (token === songRequest) lyricsLoading.value = false
      })
  try {
    if (!song.localUrl && songState(song).status === 'unknown') {
      const data = await request('/song/url/v1', { id: song.id, level: 'standard' })
      if (token !== songRequest) return
      availability.value[song.id] = {
        ...classifyAvailability(song, data.data?.[0]),
        checkedAt: Date.now(),
      }
    }
    const url = song.localUrl || songState(song).url
    if (token !== songRequest) return
    if (!url) throw new Error(songState(song).label || '这首歌曲暂不可播放')
    audio.value.src = url.replace(/^http:\/\//, 'https://')
    audio.value.volume = volume.value
    await audio.value.play()
    if (token !== songRequest) return
    recent.value = [song, ...recent.value.filter((item) => item.id !== song.id)].slice(0, 100)
  } catch (error) {
    if (token === songRequest && error.name !== 'AbortError')
      notify(
        error.message === 'Failed to fetch' ? '播放服务连接失败，请检查 API 设置' : error.message,
      )
  } finally {
    if (token === songRequest) audioLoading.value = false
  }
}

// Toggle playback while preserving the current media position.
async function togglePlay() {
  if (!currentSong.value) {
    playAll(songs.value)
    return
  }
  if (playing.value) audio.value.pause()
  else if (!audio.value.getAttribute('src')) playSong(currentSong.value)
  else {
    try {
      await audio.value.play()
    } catch {
      notify('无法播放这首歌曲，请检查版权权限或切换歌曲。')
    }
  }
}

// Play a collection starting at its first song.
async function playAll(list) {
  const token = ++songRequest
  await checkSongAvailability(list)
  if (token !== songRequest) return
  const playable = list.filter(canPlaySong)
  if (playable.length) playSong(playable[0], playable)
  else notify('当前列表暂无可播放歌曲，受限原因已标注在歌曲旁。')
}

// Advance through the queue according to the current mode.
async function skip(direction) {
  if (!queue.value.length) {
    playAll(songs.value)
    return
  }
  const token = ++songRequest
  await checkSongAvailability(queue.value)
  if (token !== songRequest) return
  const playable = queue.value.filter(canPlaySong)
  if (!playable.length) {
    notify('队列暂无可播放歌曲')
    return
  }
  const current = playable.findIndex((song) => song.id === currentSong.value?.id)
  const index =
    mode.value === 'shuffle' && playable.length > 1
      ? (Math.max(current, 0) + 1 + Math.floor(Math.random() * (playable.length - 1))) %
        playable.length
      : (current + direction + playable.length) % playable.length
  playSong(playable[index])
}

// Repeat the track or continue the queue when playback ends.
function handleEnded() {
  if (mode.value === 'one') {
    audio.value.currentTime = 0
    audio.value.play().catch(() => notify('播放失败，请重试'))
  } else if (queue.value.length) skip(1)
}

// Surface actual media errors instead of simulating playback.
function handleAudioError() {
  if (audio.value?.getAttribute('src')) {
    audioLoading.value = false
    playing.value = false
    notify('这首歌曲暂时无法播放，可能受版权限制。可尝试其他歌曲或配置 API。')
  }
}

// Seek to a timeline position from the range control or a lyric line.
function seek(seconds) {
  if (audio.value?.getAttribute('src') && Number.isFinite(audio.value.duration)) {
    audio.value.currentTime = Math.min(seconds, audio.value.duration)
    currentTime.value = audio.value.currentTime
  }
}

// Cycle list, single-track, and shuffle modes.
function cycleMode() {
  mode.value = { list: 'one', one: 'shuffle', shuffle: 'list' }[mode.value]
  notify(`已切换为${modeLabels[mode.value]}`)
}

// Check whether a track belongs to favorites.
function isFavorite(song) {
  return favorites.value.some((item) => item.id === song.id)
}

// Toggle a favorite; temporary local URLs are intentionally not persisted.
function toggleFavorite(song) {
  if (song.localUrl) {
    notify('本地文件仅在本次会话中使用，暂不支持永久收藏。')
    return
  }
  const exists = isFavorite(song)
  favorites.value = exists
    ? favorites.value.filter((item) => item.id !== song.id)
    : [...favorites.value, song]
  notify(exists ? '已取消喜欢' : '已添加到我喜欢的音乐')
}

// Start a shuffled selection from the daily songs.
function startRadio() {
  mode.value = 'shuffle'
  const list = [...songs.value].sort(() => Math.random() - 0.5)
  playAll(list)
}

// Clear active audio and the playback queue.
function clearQueue() {
  songRequest++
  audio.value.pause()
  audio.value.removeAttribute('src')
  audio.value.load()
  queue.value = []
  currentSong.value = null
  currentTime.value = 0
  duration.value = 0
  audioLoading.value = false
  lyricsLoading.value = false
  lyrics.value = []
}

// Open music service settings with the saved endpoint.
function openSettings() {
  apiInput.value = localStorage.getItem('tingyu-api') || ''
  settingsOpen.value = true
}

// Save an endpoint and reload recommendations.
function saveSettings() {
  localStorage.setItem('tingyu-api', apiInput.value.trim().replace(/\/$/, ''))
  settingsOpen.value = false
  liveData.value = false
  livePlaylists.value = false
  availabilityGeneration++
  availabilityRequests.clear()
  availability.value = {}
  checkSongAvailability([...songs.value, ...displaySongs.value, ...queue.value])
  loadHome()
  notify('服务地址已保存，正在连接…')
}

// Close every modal dialog.
function closeModals() {
  settingsOpen.value = false
  newPlaylistOpen.value = false
  songToAdd.value = null
}

// Switch the add-track dialog to the playlist creation form.
function beginNewPlaylist() {
  songToAdd.value = null
  newPlaylistOpen.value = true
}

// Create a device-only playlist.
function createPlaylist() {
  if (!playlistName.value.trim()) return
  userPlaylists.value.push({ id: `list-${Date.now()}`, name: playlistName.value.trim(), songs: [] })
  playlistName.value = ''
  newPlaylistOpen.value = false
  notify('歌单已创建')
}

// Show a local playlist without making a network request.
function openUserPlaylist(list) {
  pageRequest++
  page.value = 'playlist'
  selectedPlaylist.value = list
  playlistSongs.value = list.songs
  busy.value = false
  pageError.value = ''
}

// Add a track to a custom playlist without duplicates.
function addToPlaylist(list) {
  if (songToAdd.value.localUrl) {
    notify('本地文件暂不支持保存到持久歌单')
    songToAdd.value = null
    return
  }
  if (!list.songs.some((song) => song.id === songToAdd.value.id)) list.songs.push(songToAdd.value)
  songToAdd.value = null
  notify(`已加入「${list.name}」`)
}

// Import audio through object URLs without uploading files.
function importFiles(event) {
  const tracks = [...event.target.files]
    .filter(
      (file) => file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name),
    )
    .map((file) => {
      const url = URL.createObjectURL(file)
      objectUrls.push(url)
      return {
        id: `local-${crypto.randomUUID()}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        artist: '本地音乐',
        album: '本地导入',
        duration: 0,
        cover: fallbackCover,
        localUrl: url,
      }
    })
  localSongs.value.push(...tracks)
  event.target.value = ''
  notify(`已导入 ${tracks.length} 首音乐`)
}

// Handle playback shortcuts without interfering with form controls.
function handleKey(event) {
  if (event.key === 'Escape') {
    closeModals()
    drawer.value = ''
    return
  }
  if (event.key === 'Tab' && (settingsOpen.value || newPlaylistOpen.value || songToAdd.value)) {
    const controls = [...document.querySelectorAll('.modal button, .modal input')]
    const first = controls[0],
      last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
  if (
    event.code === 'Space' &&
    !['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(event.target.tagName) &&
    !settingsOpen.value &&
    !newPlaylistOpen.value
  ) {
    event.preventDefault()
    togglePlay()
  }
}

watch(
  () => [songs.value, displaySongs.value, queue.value],
  () => {
    checkSongAvailability([...songs.value, ...displaySongs.value, ...queue.value])
  },
  { immediate: true },
)

watch(volume, (value) => {
  if (audio.value) audio.value.volume = value
})
watch(particlesEnabled, (value) => localStorage.setItem('tingyu-particles', String(value)))
watch([settingsOpen, newPlaylistOpen, songToAdd], async () => {
  await nextTick()
  document.querySelector('.modal input, .modal .add-playlist-item, .modal button')?.focus()
})
watch(favorites, (value) => localStorage.setItem('tingyu-favorites', JSON.stringify(value)), {
  deep: true,
})
watch(
  recent,
  (value) =>
    localStorage.setItem('tingyu-recent', JSON.stringify(value.filter((song) => !song.localUrl))),
  { deep: true },
)
watch(userPlaylists, (value) => localStorage.setItem('tingyu-playlists', JSON.stringify(value)), {
  deep: true,
})
watch([activeLyric, drawer], async () => {
  await nextTick()
  const line = lyricsContainer.value?.querySelector('.is-active')
  if (line)
    lyricsContainer.value.scrollTo({
      top:
        line.offsetTop -
        lyricsContainer.value.offsetTop -
        lyricsContainer.value.clientHeight / 2 +
        line.clientHeight / 2,
      behavior: 'smooth',
    })
})

onMounted(() => {
  loadHome()
  window.addEventListener('keydown', handleKey)
})

onUnmounted(() => {
  mounted = false
  pageRequest++
  songRequest++
  clearTimeout(toastTimer)
  window.removeEventListener('keydown', handleKey)
  objectUrls.forEach((url) => URL.revokeObjectURL(url))
})
</script>

<style scoped lang="scss">
@use './styles/app.scss';
</style>
