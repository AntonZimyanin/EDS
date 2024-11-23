import { useCryptoStore } from '@/stores/cryptoStore'; //

export async function signFile(file: File): Promise<string | any> {
    const cryptoStote = useCryptoStore();
    const privateKey = cryptoStote.getPrivateKey();


    if (!privateKey) {
        throw new Error('Key pair not available for signing.');
    }

    const fileContent = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsArrayBuffer(file);
    });

    try {
        const signedBlob = await sign(fileContent, privateKey); // Sign the file content
        return URL.createObjectURL(signedBlob); // Return the file URL
    } catch (err) {
        throw new Error(`Something went wrong signing: ${(err as Error).message}\n${(err as Error).stack}`);
    }
}

async function sign(plaintext: ArrayBuffer, privateKey: CryptoKey): Promise<Blob> {
    const signature = await window.crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, privateKey, plaintext);

    const length = new Uint16Array([signature.byteLength]);
    return new Blob(
        [
            length, // Always a 2-byte unsigned integer
            signature, // "length" bytes long
            plaintext, // Remainder is the original plaintext
        ],
        // { type: 'application/octet-stream' },

        { type: 'application/pdf' },
    );
}

// Function to verify the file's signature
export async function verifyFile(file: File): Promise<string> {
    const cryptoStore = useCryptoStore();
    const publicKey = cryptoStore.getPublicKey();

    if (!publicKey) {
        throw new Error('Key pair not available for verification.');
    }

    const fileContent = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsArrayBuffer(file);
    });

    const signatureLength = new Uint16Array(fileContent.slice(0, 2))[0]; // First 16-bit integer
    const signature = new Uint8Array(fileContent.slice(2, 2 + signatureLength));
    const plaintext = new Uint8Array(fileContent.slice(2 + signatureLength));

    try {
        const verifiedBlob = await verify(plaintext.buffer, signature, publicKey);
        if (verifiedBlob === null) {
            throw new Error('Signature verification failed.');
        }

        return URL.createObjectURL(verifiedBlob);
    } catch (err) {
        throw new Error(`Something went wrong verifying: ${(err as Error).message}\n${(err as Error).stack}`);
    }
}

async function verify(plaintext: ArrayBuffer, signature: Uint8Array, publicKey: CryptoKey): Promise<Blob | null> {
    const isValid = await window.crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, publicKey, signature, plaintext);

    if (isValid) {
        return new Blob([plaintext], { type: 'application/octet-stream' });
    }
    return null;
}
