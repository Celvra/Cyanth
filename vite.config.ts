// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const buildVersion = Date.now().toString();

const SITE_URL = 'https://x0.fan';
const SITE_TITLE = 'Object2 Blog';
const SITE_DESC = '一个简单的博客';

function getContentRoutes(): string[] {
  const contentDir = join(process.cwd(), 'src', 'content', 'articles');
  try {
    return readdirSync(contentDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => `/posts/${f.replace(/\.md$/, '')}`);
  } catch {
    return [];
  }
}

function generateFeedXml(): string {
  const contentDir = join(process.cwd(), 'src', 'content', 'articles');
  const files = readdirSync(contentDir).filter((f) => f.endsWith('.md'));
  const items: Array<{ title: string; desc: string; link: string; date: string; cat: string }> = [];

  for (const file of files) {
    const raw = matter(readFileSync(join(contentDir, file), 'utf-8')).data as Record<string, unknown>;
    if (raw['draft']) {
      continue;
    }
    items.push({
      title: (raw['title'] as string) ?? 'Untitled',
      desc: (raw['description'] as string) ?? '',
      link: `/posts/${file.replace(/\.md$/, '')}`,
      date: raw['published'] ? new Date(raw['published'] as string).toUTCString() : new Date().toUTCString(),
      cat: (raw['category'] as string) ?? '',
    });
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESC}</description>
    <language>zh-cn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items.map((i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${SITE_URL}${i.link}</link>
      <guid isPermaLink="true">${SITE_URL}${i.link}</guid>
      <pubDate>${i.date}</pubDate>
      <description>${esc(i.desc)}</description>${i.cat ? `\n      <category>${esc(i.cat)}</category>` : ''}
    </item>`).join('\n')}
  </channel>
</rss>`;
}

export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
  },
  ssr: {
    noExternal: ['@material/material-color-utilities'],
  },
  plugins: [
    {
      name: 'rss-feed',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/feed.xml') {
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(generateFeedXml());
          } else {
            next();
          }
        });
      },
      closeBundle() {
        const outDir = join(process.cwd(), 'dist', 'analog', 'public');
        try {
          mkdirSync(outDir, { recursive: true });
        } catch {}
        writeFileSync(join(outDir, 'feed.xml'), generateFeedXml());
      },
    },
    analog({
      apiPrefix: '/api',
      content: {
        highlighter: 'prism',
      },
      prerender: {
        routes: async () => ['/', '/about', '/archive', ...getContentRoutes()],
        sitemap: {
          host: 'https://www.example.com',
        },
      },
    }),
    {
      name: 'build-version',
      transformIndexHtml(html) {
        return html.replace(/__BUILD_VERSION__/g, buildVersion);
      },
    },
  ],
  server: {
    proxy: {
      '/wallpaper-api': {
        target: 'https://api.fuchenboke.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/wallpaper-api/, ''),
      },
    },
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
