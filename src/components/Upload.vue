<script setup lang="ts">
// Core 
import { ref } from 'vue';

const props = defineProps<{
    title: string;
}>();

const emit = defineEmits(["upload:file"]);

const fileInput = ref<HTMLInputElement|null>(null);

const fileUpload = () => {
    const file = fileInput.value?.files?.item(0);

    if (!file) return;

    emit("upload:file", file);
};

function clickToInput() {
    fileInput.value?.click();
}
</script>

<template>
    <button
        class="w-full text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center dark:focus:ring-[#4285F4]/55 mb-2"
        @click="clickToInput">
        {{ title }}
    </button>
    <input accept="application/pdf" type="file" class="hidden" ref="fileInput" @change="fileUpload" />
</template>
