// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SITE_URL = 'https://x0.fan';
const SITE_TITLE = 'Object2 Blog';
const SITE_DESC = '一个简单的博客';
const contentDir = path.join(process.cwd(), 'src', 'content', 'articles');
const outPath = path.join(process.cwd(), 'dist', 'analog', 'public', 'feed.xml');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const items = fs
  .readdirSync(contentDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const { data } = matter(fs.readFileSync(path.join(contentDir, f), 'utf-8'));
    if (data.draft) return null;
    return {
      title: data.title ?? 'Untitled',
      desc: data.description ?? '',
      link: `/posts/${f.replace(/\.md$/, '')}`,
      date: data.published ? new Date(data.published).toUTCString() : new Date().toUTCString(),
      cat: data.category ?? '',
    };
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const xml = `<?xml version="1.0" encoding="UTF-8"?>
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

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, xml);
console.log('feed.xml generated');
