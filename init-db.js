
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BOOKS, ARTICLES, AUDIOS, VIDEOS } from './constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'db.json');

const db = {
    books: BOOKS,
    articles: ARTICLES,
    audios: AUDIOS,
    videos: VIDEOS,
};

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('db.json created successfully with initial data!');
