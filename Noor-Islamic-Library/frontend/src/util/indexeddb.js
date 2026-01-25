const DB_NAME = 'NoorLibraryDB';
const DB_VERSION = 1;

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('cache')) {
                db.createObjectStore('cache', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveToCache = async (key, data) => {
    const db = await initDB();
    const tx = db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    store.put({ id: key, data, timestamp: Date.now() });
    return tx.complete;
};

export const getFromCache = async (key) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('cache', 'readonly');
        const store = tx.objectStore('cache');
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.data || null);
        request.onerror = () => reject(request.error);
    });
};
