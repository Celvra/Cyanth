// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
/**
 * 配置文件
 */

export const blogConfig = {
  /* 网站信息 */
  site: {
    title: 'Object2 Blog',
    subtitle: '一个简单的博客',
    lang: 'zh',
    siteURL: 'https://x0.fan', // 你的博客链接
    description: '一个使用 Angular 制作的博客',
    favicon: '/avatar.jpg',
  },

  /* 个人信息 */
  profile: {
    name: 'Object2',
    avatar: '/avatar.jpg',
    bio: '一只大杂鱼',
    status: '摆烂中',
    badge: '站长',
    userId: '#1776',
    guestLabel: '访客',
  },

  /* 个人媒体 */
  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com/Celvra', icon: 'code' },
    { platform: 'Email', url: 'mailto:qx@x0.fan', icon: 'mail' },
  ] as Array<{ platform: string; url: string; icon: string }>,

  /* 友链 */
  friendLinks: [
    {
      name: 'Angular',
      avatar: 'https://angular.dev/assets/icons/favicon.ico',
      bio: '一个基于 TS 的开源 Web 应用框架',
      link: 'https://angular.dev/',
    },
  ] as Array<{ name: string; avatar: string; bio: string; link?: string }>,

  /* 频道 */
  navChannels: [
    { label: 'nav.home', href: '/', icon: 'home', id: 'home' },
    { label: 'nav.about', href: '/about', icon: 'info', id: 'about' },
    { label: 'nav.archive', href: '/archive', icon: 'archive', id: 'archive' },
  ] as Array<{ label: string; href: string; icon: string; id: string }>,

  /* 主题 */
  theme: {
    defaultSeedColor: '#6750A4',
    wallpaperApi: '/wallpaper-api/api/dongman.php',
    backgroundBlur: 16,
    backgroundBrightness: 0.7,
    defaultDarkMode: 'auto' as 'auto' | 'light' | 'dark',
  },

  /* i18n */
  i18n: {
    defaultLocale: 'zh-CN' as 'zh-CN' | 'en-US',
  },

  /* 音乐播放器 */
  music: {
    enable: true,
    mode: 'meting' as 'local' | 'meting',
    metingApi: 'https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&auth=:auth&r=:r', // 测试用 API
    metingId: '151094169', // 试试我的神人音乐品味
    metingServer: 'netease',
    metingType: 'playlist',
    localPlaylist: [] as Array<{
      id: number;
      title: string;
      artist: string;
      cover: string;
      url: string;
      duration: number;
    }>,
  },

  /* 布局 */
  layout: {
    navSidebarWidth: 72,
    channelSidebarWidth: 240,
    memberSidebarWidth: 240,
    topBarHeight: 64,
    mobileBreakpoint: 768,
  },

  /* Github 贡献图 */
  github: {
    username: 'Celvra',
  },

  /* 关于 */
  about: {
    techStack: 'Kotlin, Java, Rust, React, Vue, Angular',
    createdDate: '2026/5/31',
    markdown: `
## 关于本站

本站是一个基于 Angular 开发的博客，你可以在 Github 上搜索 "Cyanth" 以找到这个项目喵！

## 关于我

我是一个笨蛋开发者。平时喜欢写写前端，用 AI 制作自己喜欢的项目。<br>
最喜欢的 UI 样式是 Material Design 3 。<br>
喜欢可乐和软软的被窝。


    `.trim(),
  },

  /* 评论 */
  comments: {
    enabled: false,
    provider: 'twikoo' as 'twikoo',
    twikoo: {
      envId: '', // 输入你的 twikoo 地址
      region: '' /* 可选 */,
    },
  },

  /* 版权 */
  copyright: {
    enabled: true,
    text: '© 2026 Object2. All rights reserved.',
    license: 'CC BY-NC-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
};
