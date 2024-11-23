import { ref } from 'vue';

import { defineStore } from 'pinia';

import { saveKeys } from '@/utils/index_db';

export const useCryptoStore = defineStore('cryptos', () => {
    const _publicKey = ref<CryptoKey | null>(null);
    const _privateKey = ref<CryptoKey | null>(null);

    function getPublicKey(): CryptoKey | null {
        return _publicKey.value;
    }

    function getPrivateKey(): CryptoKey | null {
        return _privateKey.value;
    }

    function setKeyPair(pubKey: CryptoKey, privKey: CryptoKey): void {
        _publicKey.value = pubKey;
        _privateKey.value = privKey;
    }

    async function generateKeyPair() {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: 'RSASSA-PKCS1-v1_5',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]), // 24-bit representation of 65537
                hash: { name: 'SHA-256' },
            },
            true, // Can extract the key later if needed
            ['sign', 'verify'],
        );


        _publicKey.value = keyPair.publicKey;
        _privateKey.value = keyPair.privateKey;

        await saveKeys(keyPair.publicKey, keyPair.privateKey);
    }

    return { getPublicKey, getPrivateKey, setKeyPair, generateKeyPair };
});
