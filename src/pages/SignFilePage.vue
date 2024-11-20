<script setup lang="ts">
// Core
import {
    computed
} from "vue";

import { RouterLink } from "vue-router";

import { useFileStore } from "@/stores/fileStore";

import SignatureContainer from "@/components/SignatureContainer.vue";

// Store
const fileStore = useFileStore();

// Data
const file = fileStore.getFile();

// Computed
const fileSrc = computed(() => {
    if (null === file) return;

    return URL.createObjectURL(file);
});

</script>

<template>
    <div class="max-w-[50rem] m-auto">

        <div class="mb-[1.25rem] pr-4 pl-4 pt-2">

            <object :data="fileSrc" type="application/pdf" width="100%" height="500px">
                <p>Your browser does not support displaying PDF. Download the file to view it.</p>
            </object>
        </div>
    </div>
    <SignatureContainer :title="'signature'" />
</template>

<style scoped></style>
