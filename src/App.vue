<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useFileStore } from '@/stores/fileStore';
import { useCryptoStore } from '@/stores/cryptoStore';

import { getKeys, setInitializationFlag, getInitializationFlag } from './utils/index_db';

const route = useRoute();

const showLink = ref(route.path !== '/home');

onMounted(async () => {
    const fileStore = useFileStore();
    fileStore.setFile(null);

    const cryptoStore = useCryptoStore();

    try {
        const isKeys = await getInitializationFlag();
        (isKeys);
        
        if (!isKeys) {
            await setInitializationFlag(); 
            await cryptoStore.generateKeyPair(); 
            return;
        }

        const pubKey = cryptoStore.getPublicKey();

        if (pubKey !== null) {
            return;
        }

        const { publicKey, privateKey } = await getKeys();
        
        cryptoStore.setKeyPair(publicKey, privateKey); // Устанавливаем ключи в store
    } catch (error) {
        console.error("Failed to initialize keys or handle crypto store:", error);
    }
});

</script>

<template>
    <div>
        <nav v-if="true" class="ml-4 mt-4 mr-4">
            <RouterLink
                style="margin-bottom: 1rem !important; background-color: white; padding-left: 0.5rem; padding-right: 1rem; padding-top: 0.5rem; padding-bottom: 0.5rem;"
                class="rounded-lg" to="/home">↲ to home</RouterLink>
            <hr style="margin-top: 1rem; background-color: white;" class="h-px pr-2 bg-white border-0 dark:bg-white">
        </nav>
    </div>
    <RouterView></RouterView>
</template>

<style scoped>
* {
    margin: 0;
    /* Removes all default margins */
    padding: 0;
    /* Removes all default padding */
    background-color: #1e1e1e;
    /* Sets the background color */
    box-sizing: border-box;
    /* Ensures padding and border are included in element size */
}

html,
body {
    height: 100%;
    /* Ensures the page spans the entire viewport */
}

#app {
    min-height: 100%;
    /* Ensures the Vue app spans the full viewport height */
}

/* Добавленные стили для nav */
nav {
    padding-left: 1rem;
    /* Tailwind's ml-4 */
    padding-top: 1rem;
    /* Tailwind's mt-4 */
    padding-right: 1rem;
    /* Tailwind's mr-4 */
}

/* Добавленные стили для RouterLink */
RouterLink {
    font-weight: 500;
    /* Tailwind's font-medium */
    font-size: 1rem;
    /* Tailwind's text-base */
    background-color: white;
}
</style>
