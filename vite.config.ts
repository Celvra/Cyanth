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
import { blogConfig } from './src/app/core/config';

const buildVersion = Date.now().toString();

function getContentRoutes(): string[] {
  const contentDir = join(process.cwd(), 'src', 'content', 'articles');
  try {
    return readdirSync(contentDir)
      .filter(f => f.endsWith('.md'))
      .map(f => `/posts/${f.replace(/\.md$/, '')}`);
  } catch {
    return [];
  }
}

function generateSitemapXml(origin: string): string {
  const routes = ['/', '/about', '/archive', ...getContentRoutes()];
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url><loc>${origin}${r}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>`;
}

function generateFeedXml(origin: string): string {
  const contentDir = join(process.cwd(), 'src', 'content', 'articles');
  let items: Array<{ title: string; desc: string; link: string; date: string; cat: string }> = [];

  try {
    items = readdirSync(contentDir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const raw = matter(readFileSync(join(contentDir, f), 'utf-8')).data as Record<string, unknown>;
        if (raw['draft']) {
          return null;
        }
        return {
          title: typeof raw['title'] === 'string' ? raw['title'] : 'Untitled',
          desc: typeof raw['description'] === 'string' ? raw['description'] : '',
          link: `/posts/${f.replace(/\.md$/, '')}`,
          date: typeof raw['published'] === 'string' ? new Date(raw['published']).toUTCString() : new Date().toUTCString(),
          cat: typeof raw['category'] === 'string' ? raw['category'] : '',
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    // content directory may not exist
  }

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${blogConfig.site.title}</title>
    <link>${origin}</link>
    <description>${blogConfig.site.description}</description>
    <language>zh-cn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    i => `    <item>
      <title>${esc(i.title)}</title>
      <link>${origin}${i.link}</link>
      <guid isPermaLink="true">${origin}${i.link}</guid>
      <pubDate>${i.date}</pubDate>
      <description>${esc(i.desc)}</description>${i.cat ? `\n      <category>${esc(i.cat)}</category>` : ''}
    </item>`,
  )
  .join('\n')}
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
      name: 'rss-sitemap',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const origin = `http://${req.headers.host ?? 'localhost:5173'}`;
          if (req.url === '/feed.xml') {
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(generateFeedXml(origin));
          } else if (req.url === '/sitemap.xml') {
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(generateSitemapXml(origin));
          } else {
            next();
          }
        });
      },
      closeBundle() {
        const outDir = join(process.cwd(), 'dist', 'analog', 'public');
        const poll = (n = 100): void => {
          try {
            if (readdirSync(outDir).includes('sitemap.xml')) {
              writeFileSync(join(outDir, 'feed.xml'), generateFeedXml(blogConfig.site.siteURL));
            } else if (n > 0) {
              setTimeout(() => poll(n - 1), 200);
            }
          } catch {
            if (n > 0) {
              setTimeout(() => poll(n - 1), 200);
            }
          }
        };
        poll();
      },
    },
    analog({
      apiPrefix: '/api',
      content: {
        highlighter: 'prism',
      },
      prerender: {
        routes: () => ['/', '/about', '/archive', ...getContentRoutes()],
        sitemap: {
          host: blogConfig.site.siteURL,
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
  server: {},
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
