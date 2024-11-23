export async function saveKeys(pubKey: CryptoKey, privKey: CryptoKey) {
    const publicKeyData = await crypto.subtle.exportKey("jwk", pubKey);
    const privateKeyData = await crypto.subtle.exportKey("jwk", privKey);

    callOnStore((store: IDBObjectStore) => {
        store.put({ id: 1, publicKey: publicKeyData, privateKey: privateKeyData });
    });
}

export async function getKeys(): Promise<{ id: number; publicKey: CryptoKey; privateKey: CryptoKey }> {
    return new Promise((resolve, reject) => {
        callOnStore((store: IDBObjectStore) => {
            const request = store.get(1);

            request.onsuccess = async function () {
                const data = request.result;

                if (!data) {
                    reject(new Error("No keys found in the database."));
                    return;
                }

                try {
                    const publicKey = await crypto.subtle.importKey(
                        "jwk",
                        data.publicKey,
                        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
                        true,
                        ["verify"]
                    );

                    const privateKey = await crypto.subtle.importKey(
                        "jwk",
                        data.privateKey,
                        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
                        true,
                        ["sign"]
                    );

                    resolve({ id: 1, publicKey, privateKey });
                } catch (error) {
                    reject(error);
                }
            };

            request.onerror = () => {
                reject(request.error || new Error("Failed to retrieve keys."));
            };
        });
    });
}

function callOnStore(fn__: (store: IDBObjectStore) => void) {
    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    const conn = indexedDB.open("crypto_store", 1);

    conn.onupgradeneeded = () => {
        const db = conn.result;
        db.createObjectStore("keys", { keyPath: "id" });
    };

    conn.onsuccess = () => {
        const db = conn.result;
        const tx = db.transaction("keys", "readwrite");
        const store = tx.objectStore("keys");

        fn__(store);

        tx.oncomplete = () => {
            db.close();
        };
    };

    conn.onerror = () => {
        console.error("IndexedDB connection failed.");
    };
}




export async function setInitializationFlag() {
    return new Promise<void>((resolve, reject) => {
        callOnStore((store: IDBObjectStore) => {
            const request = store.put({ id: 'initialization', hasRun: true });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error || new Error('Failed to set initialization flag.'));
        });
    });
}

export async function getInitializationFlag(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        callOnStore((store: IDBObjectStore) => {
            const request = store.get('initialization');

            request.onsuccess = () => {
                const data = request.result;
                resolve(data?.hasRun || false);
            };
            request.onerror = () => reject(request.error || new Error('Failed to check initialization flag.'));
        });
    });
}