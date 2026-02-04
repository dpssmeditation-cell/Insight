import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Book, Article, Audio, Video, Artist } from '../types';

export const firebaseService = {
    // Generic fetch all documents from a collection
    getAll: async <T>(collectionName: string): Promise<T[]> => {
        try {
            const q = query(collection(db, collectionName));
            const querySnapshot = await getDocs(q);
            const items: T[] = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as T);
            });
            return items;
        } catch (error) {
            console.error(`Error fetching ${collectionName}:`, error);
            return [];
        }
    },

    // Save (create or update) a document
    save: async <T extends { id: string }>(
        collectionName: string,
        item: T
    ): Promise<T[]> => {
        try {
            const docRef = doc(db, collectionName, item.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Update existing document
                await updateDoc(docRef, { ...item });
            } else {
                // Create new document with specific ID
                await setDoc(docRef, item);
            }

            // Return updated list
            return await firebaseService.getAll<T>(collectionName);
        } catch (error) {
            console.error(`Error saving to ${collectionName}:`, error);
            throw error;
        }
    },

    // Delete a document
    delete: async <T>(collectionName: string, id: string): Promise<T[]> => {
        try {
            await deleteDoc(doc(db, collectionName, id));
            return await firebaseService.getAll<T>(collectionName);
        } catch (error) {
            console.error(`Error deleting from ${collectionName}:`, error);
            throw error;
        }
    },

    // Specialized methods for each collection
    getBooks: () => firebaseService.getAll<Book>('books'),
    saveBook: (book: Book) => firebaseService.save<Book>('books', book),
    deleteBook: (id: string) => firebaseService.delete<Book>('books', id),

    getArticles: () => firebaseService.getAll<Article>('articles'),
    saveArticle: (article: Article) => firebaseService.save<Article>('articles', article),
    deleteArticle: (id: string) => firebaseService.delete<Article>('articles', id),

    getAudios: () => firebaseService.getAll<Audio>('audios'),
    saveAudio: (audio: Audio) => firebaseService.save<Audio>('audios', audio),
    deleteAudio: (id: string) => firebaseService.delete<Audio>('audios', id),

    getVideos: () => firebaseService.getAll<Video>('videos'),
    saveVideo: (video: Video) => firebaseService.save<Video>('videos', video),
    deleteVideo: (id: string) => firebaseService.delete<Video>('videos', id),

    getArtists: () => firebaseService.getAll<Artist>('artists'),
    saveArtist: (artist: Artist) => firebaseService.save<Artist>('artists', artist),
    deleteArtist: (id: string) => firebaseService.delete<Artist>('artists', id),
};
