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
    orderBy,
    increment,
    onSnapshot
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
            // Sort by createdAt desc (newest first)
            items.sort((a: any, b: any) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
            return items;
        } catch (error) {
            console.error(`Error fetching ${collectionName}:`, error);
            return [];
        }
    },

    // Real-time subscription
    subscribe: <T>(collectionName: string, callback: (items: T[]) => void) => {
        const q = query(collection(db, collectionName));
        return onSnapshot(q, (querySnapshot) => {
            const items: T[] = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as T);
            });
            // Sort by createdAt desc (newest first)
            items.sort((a: any, b: any) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
            callback(items);
        }, (error) => {
            console.error(`Error subscribing to ${collectionName}:`, error);
        });
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
    subscribeBooks: (cb: (items: Book[]) => void) => firebaseService.subscribe<Book>('books', cb),
    saveBook: (book: Book) => firebaseService.save<Book>('books', book),
    deleteBook: (id: string) => firebaseService.delete<Book>('books', id),

    getArticles: () => firebaseService.getAll<Article>('articles'),
    subscribeArticles: (cb: (items: Article[]) => void) => firebaseService.subscribe<Article>('articles', cb),
    saveArticle: (article: Article) => firebaseService.save<Article>('articles', article),
    deleteArticle: (id: string) => firebaseService.delete<Article>('articles', id),

    getAudios: () => firebaseService.getAll<Audio>('audios'),
    subscribeAudios: (cb: (items: Audio[]) => void) => firebaseService.subscribe<Audio>('audios', cb),
    saveAudio: (audio: Audio) => firebaseService.save<Audio>('audios', audio),
    deleteAudio: (id: string) => firebaseService.delete<Audio>('audios', id),

    getVideos: () => firebaseService.getAll<Video>('videos'),
    subscribeVideos: (cb: (items: Video[]) => void) => firebaseService.subscribe<Video>('videos', cb),
    saveVideo: (video: Video) => firebaseService.save<Video>('videos', video),
    deleteVideo: (id: string) => firebaseService.delete<Video>('videos', id),

    getArtists: () => firebaseService.getAll<Artist>('artists'),
    subscribeArtists: (cb: (items: Artist[]) => void) => firebaseService.subscribe<Artist>('artists', cb),
    saveArtist: (artist: Artist) => firebaseService.save<Artist>('artists', artist),
    deleteArtist: (id: string) => firebaseService.delete<Artist>('artists', id),

    incrementView: async (collectionName: string, id: string) => {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, {
                views: increment(1)
            });
        } catch (error) {
            console.error(`Error incrementing view for ${collectionName}/${id}:`, error);
        }
    }
};
