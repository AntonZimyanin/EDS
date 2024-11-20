import { ref } from 'vue';

import { defineStore } from 'pinia';

export const useCryptoStore = defineStore('cryptos', () => {
    const _publicKey = ref<CryptoKey | null>(null);
    const _privateKey = ref<CryptoKey | null>(null);

    function getPublicKey(): CryptoKey | null {
        return _publicKey.value;
    }

    function getPrivateKey(): CryptoKey | null {
        return _privateKey.value;
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

        localStorage.setItem('publicKey', JSON.stringify(keyPair.publicKey));
        localStorage.setItem('privateKey', JSON.stringify(keyPair.privateKey));

        // _publicKey.value = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
        // _privateKey.value = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
        _publicKey.value = keyPair.publicKey;
        _privateKey.value = keyPair.privateKey;
    }

    async function handleKeyPair(existingPublicKeyPem = null, existingPrivateKeyPem = null) {
        let publicKey, privateKey;

        if (existingPublicKeyPem && existingPrivateKeyPem) {
            // Преобразуем PEM в бинарный формат (DER)
            const pemToBinary = (pem: string) => {
                const base64 = pem
                    .replace(/-----BEGIN (PUBLIC|PRIVATE) KEY-----/g, '')
                    .replace(/-----END (PUBLIC|PRIVATE) KEY-----/g, '')
                    .replace(/\n/g, '')
                    .trim();
                return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
            };

            const publicKeyBinary = pemToBinary(existingPublicKeyPem);
            const privateKeyBinary = pemToBinary(existingPrivateKeyPem);

            publicKey = await window.crypto.subtle.importKey(
                'spki',
                publicKeyBinary.buffer,
                { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
                true,
                ['verify'],
            );

            privateKey = await window.crypto.subtle.importKey(
                'pkcs8',
                privateKeyBinary.buffer,
                { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
                true,
                ['sign'],
            );
            
            console.log(publicKey, privateKey);

            _publicKey.value = publicKey;
            _privateKey.value = privateKey;

        } else {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: 'RSASSA-PKCS1-v1_5',
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: { name: 'SHA-256' },
                },
                true,
                ['sign', 'verify'],
            );

            publicKey = keyPair.publicKey;
            privateKey = keyPair.privateKey;
            console.log(publicKey, "\n", privateKey, "aaa");


            _publicKey.value = keyPair.publicKey;
            _privateKey.value = keyPair.privateKey;
        }

        // Экспортируем ключи в формате JWK для хранения
        const exportedPublicKey = await window.crypto.subtle.exportKey('jwk', publicKey);
        const exportedPrivateKey = await window.crypto.subtle.exportKey('jwk', privateKey);

        localStorage.setItem('publicKey', JSON.stringify(exportedPublicKey));
        localStorage.setItem('privateKey', JSON.stringify(exportedPrivateKey));

        return { publicKey, privateKey };
    }

    // Использование с PEM-ключами из .env

    //   const publicKeyPem = process.env.PUBLIC_KEY; // Ваш PEM-ключ из .env
    //   const privateKeyPem = process.env.PRIVATE_KEY;

    //   handleKeyPair(publicKeyPem, privateKeyPem).then((keys) => {
    //     console.log('Keys imported or generated:', keys);
    //   });

    return { getPublicKey, getPrivateKey, generateKeyPair, handleKeyPair };
});
