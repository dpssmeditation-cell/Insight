// Script to import existing data to Firebase Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAgAni6KooBSSOKs_wedlVosVSXz98xWSo",
    authDomain: "insight-sharing-a16eb.firebaseapp.com",
    projectId: "insight-sharing-a16eb",
    storageBucket: "insight-sharing-a16eb.firebasestorage.app",
    messagingSenderId: "28555261482",
    appId: "1:28555261482:web:6dff42dadd8e8c8545f553",
    measurementId: "G-Z8KKLY2TVY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importData() {
    console.log('Starting data import to Firebase...\n');

    try {
        // Read data from db.json
        const data = JSON.parse(readFileSync('./db.json', 'utf8'));

        // Import Books
        console.log(`Importing ${data.books.length} books...`);
        for (const book of data.books) {
            await setDoc(doc(db, 'books', book.id), book);
            console.log(`  ✓ Imported: ${book.title}`);
        }

        // Import Articles
        console.log(`\nImporting ${data.articles.length} articles...`);
        for (const article of data.articles) {
            await setDoc(doc(db, 'articles', article.id), article);
            console.log(`  ✓ Imported: ${article.title}`);
        }

        // Import Audios
        console.log(`\nImporting ${data.audios.length} audio tracks...`);
        for (const audio of data.audios) {
            await setDoc(doc(db, 'audios', audio.id), audio);
            console.log(`  ✓ Imported: ${audio.title}`);
        }

        // Import Videos
        console.log(`\nImporting ${data.videos.length} videos...`);
        for (const video of data.videos) {
            await setDoc(doc(db, 'videos', video.id), video);
            console.log(`  ✓ Imported: ${video.title}`);
        }

        console.log('\n✅ Data import completed successfully!');
        console.log(`\nSummary:`);
        console.log(`  - Books: ${data.books.length}`);
        console.log(`  - Articles: ${data.articles.length}`);
        console.log(`  - Audio: ${data.audios.length}`);
        console.log(`  - Videos: ${data.videos.length}`);
        console.log(`  - Total: ${data.books.length + data.articles.length + data.audios.length + data.videos.length} items`);

    } catch (error) {
        console.error('\n❌ Error importing data:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Run the import
importData();
