
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://www.insightsharing.org';
const PUBLIC_DIR = path.join(__dirname, '../public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');
const DB_PATH = path.join(__dirname, '../db.json');

const pages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '?v=books', changefreq: 'daily', priority: 0.9 },
    { url: '?v=articles', changefreq: 'daily', priority: 0.8 },
    { url: '?v=audio', changefreq: 'daily', priority: 0.8 },
    { url: '?v=multimedia', changefreq: 'daily', priority: 0.8 },
    { url: '?v=about', changefreq: 'monthly', priority: 0.5 },
];

try {
    const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

    if (dbData.books) {
        dbData.books.forEach(book => {
            pages.push({ url: `?v=books&id=${book.id}`, changefreq: 'weekly', priority: 0.7 });
        });
    }

    if (dbData.articles) {
        dbData.articles.forEach(article => {
            pages.push({ url: `?v=articles&id=${article.id}`, changefreq: 'weekly', priority: 0.7 });
        });
    }

    if (dbData.audios) {
        dbData.audios.forEach(audio => {
            pages.push({ url: `?v=audio&id=${audio.id}`, changefreq: 'weekly', priority: 0.6 });
        });
    }

    if (dbData.videos) {
        dbData.videos.forEach(video => {
            pages.push({ url: `?v=multimedia&id=${video.id}`, changefreq: 'weekly', priority: 0.6 });
        });
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${DOMAIN}/${page.url === '/' ? '' : page.url.replace(/&/g, '&amp;')}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(SITEMAP_PATH, sitemap);
    console.log(`✅ Sitemap generated successfully at ${SITEMAP_PATH}`);
} catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
}
