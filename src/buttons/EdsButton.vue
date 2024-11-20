<script setup lang="ts">
// Core
import { defineProps } from 'vue';

const props = defineProps<{
    title: string;
}>();

</script>
<template>
    <button
        class="w-full text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex text-center justify-center items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2">
        {{ title }}
    </button>
</template>
