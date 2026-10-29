<<<<<<< HEAD
# 听屿 TINGYU

Vue 3 + JavaScript + SCSS 音乐播放器，使用网易云真实数据，支持桌面与手机窄屏。

## Windows 桌面应用

打包结果位于 `release`：

- `Tingyu-1.1.0-Portable.exe`：免安装版，双击直接打开，可以把此文件移动到常用文件夹并创建快捷方式。
- `Tingyu-1.1.0-Setup.exe`：安装向导，可选择安装目录并创建桌面、开始菜单快捷方式。

支持 Windows 10/11 64 位。使用时不需要安装 Node.js、不需要启动终端或开发服务器；网易云在线音乐仍然需要网络，版权和会员权限限制与网页版一致。

桌面版内置 Electron 运行时、播放器静态资源和网易云数据代理，通过 `tingyu://app` 提供固定本地来源，不监听网络端口。收藏、歌单和设置存储在此应用自己的用户数据目录，与网页版浏览器的数据分开。重复点击图标会唤起已打开的窗口，关闭窗口后退出程序。

从源码构建：

```sh
npm install
npm run desktop:setup
npm run desktop:build
```

`npm run desktop:dev` 会构建前端并打开桌面应用。图标已包含在 `build` 中，可在 Windows 使用 `powershell -File scripts/create-icon.ps1` 重新生成。首次构建需下载 Electron 和 NSIS 工具。当前生成的是未签名本地构建包。

###

使用 Electron + electron-builder 打包：

- Vue 3 + Vite：构建播放器界面。
- Electron：提供桌面窗口，内置 Chromium 和 Node.js。
- 内置 API 代理：随应用运行，无需另外启动后端。
- electron-builder：生成免安装 EXE 和 NSIS 安装包。

## 运行

建议 Node.js 22.18+ 或 24.12+，使用项目中的 npm 锁文件。

```sh
npm install
npm run dev
```

打开终端显示的本地地址。开发和预览服务器内置 `/api` 数据代理，无需另外安装后端。

```sh
npm run build
npm start
```

生产服务在 `http://localhost:3000` 同时托管 dist 和 API。也可以运行 `npm run preview`。纯静态部署需要配置外部 API，静态托管不会运行 Node 代理。

## 功能

- 网易云推荐歌单、排行榜、歌单详情、歌曲搜索与专辑封面。
- 列表加载时批量检测播放权限，提前标注会员、付费、版权受限、暂不可播放或仅试听；检测失败显示“权限未确认”，播放全部与切歌跳过已确认受限歌曲。权限缓存 5 分钟，切换 API 服务后重新检测。
- 真实音频播放、暂停、上一首/下一首、进度拖动、音量与静音。
- 歌曲列表和播放栏提供下载入口。桌面版可选择保存位置并在完成后提示；网页版通过内置代理准备浏览器下载。下载前重新检查网易云公开完整音频，会员/版权受限、仅试听、权限未确认及本地文件禁用下载；失败时清理临时文件，已有文件不受影响。外部 API 的账户权限不会传递给公开下载服务。
- 底部 Canvas 蓝色音符漂浮特效，随播放启停、音量调节强度，可关闭并记住偏好；隐藏页面及系统减少动态效果时停止渲染。它是装饰性播放动画，不是音频频谱分析。
- 列表循环、单曲循环、随机播放，私人漫游基于当前每日歌曲随机播放。
- LRC 歌词同步高亮、自动滚动、点击歌词跳转；纯音乐和请求失败有对应提示。
- 播放队列、移除歌曲、清空队列。
- 喜欢歌曲、最近播放、自建歌单与添加歌曲，保存在当前浏览器 localStorage。
- 本地音频导入（不上传），文件仅在当前页面会话有效。
- 空格播放/暂停，Esc 关闭面板或弹窗，表单不触发播放快捷键。
- 请求超时、失败重试、空状态和过期请求保护。

## API 配置

在左下角「设置与 API」配置自己部署的 NeteaseCloudMusicApi 兼容服务。留空使用内置网易云公开接口代理，也可在 `.env.local` 设置：

```dotenv
VITE_NETEASE_API=https://your-api.example.com
```

使用的兼容接口：`/personalized`、`/cloudsearch`、`/song/detail`、`/song/url/v1`、`/lyric`、`/playlist/detail`、`/toplist`。外部 API 需要允许前端所在源的 CORS 请求，建议 HTTPS。

内置代理只请求网易云固定域名，不接受任意上游 URL，不处理账户登录或 cookie。播放取决于网易云返回的音频 URL；会员、版权、地区受限歌曲提示不可播放，不模拟播放状态。默认标准音质。歌单展示接口返回的前 100 首，搜索最多 50 首。

首页先展示标注的编辑精选和已知歌曲资料，随后替换为实时数据。背景来自 Unsplash，真实歌曲及歌单封面来自网易云。外部图片和 Google Fonts 需要网络，字体有系统回退。

## 验证

```sh
npm run test
npm run lint
npm run build
```

测试覆盖 LRC 多时间戳解析、两种歌曲数据结构兼容、版权限制响应和 API 失败处理。
=======
# muzic-tingyu
一款音乐播放器
>>>>>>> c4f81de77c466d4686de664ddebcdc14e116b35e
