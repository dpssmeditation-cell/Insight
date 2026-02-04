import { ref, onValue, onDisconnect, set, serverTimestamp, goOffline, goOnline } from 'firebase/database';
import { rtdb } from '../firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth'; // Keep auth import if needed later for authenticated presence

export const presenceService = {
    // Track presence for the current user
    trackPresence: () => {
        // Reference to the special '.info/connected' path in RTDB
        const connectedRef = ref(rtdb, '.info/connected');

        // Create a unique ID for this session (or use auth ID if available, but anonymity is fine for viewer count)
        // We'll use a random ID for anonymous viewers to avoid auth complexity for now
        const sessionId = Math.random().toString(36).substring(2, 15);
        const myConnectionsRef = ref(rtdb, `connections/${sessionId}`);

        // Listen to the connection state
        const unsubscribe = onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                // We're connected (or reconnected)!

                // When I disconnect, remove this device
                onDisconnect(myConnectionsRef).remove();

                // Add this device to my connections list
                // We can store a timestamp or other info if we want
                set(myConnectionsRef, {
                    visitedAt: serverTimestamp(),
                    // You could add userId here if logged in
                });
            }
        });

        return () => {
            // Cleanup listener
            unsubscribe();
            // Manually remove presence if needed (though onDisconnect handles the unclean break)
            // set(myConnectionsRef, null); 
        };
    },

    // Subscribe to the total count of connections
    subscribeToViewerCount: (callback: (count: number) => void) => {
        const connectionsRef = ref(rtdb, 'connections');

        return onValue(connectionsRef, (snap) => {
            const count = snap.exists() ? Object.keys(snap.val()).length : 0;
            callback(count);
        });
    }
};
