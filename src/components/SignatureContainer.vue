<script setup lang="ts">
// Core
import { defineProps } from 'vue';

// Components
import SignatureCanvas from "@/components/canvas/SignatureCanvas.vue";

const props = defineProps<{
    title: string;
}>();

</script>

<template>
    <div class="m-2">
        <h3 class="mb-2 pr-4 pl-4 pt-2"> {{ title }}</h3>
        <SignatureCanvas />
    </div>
</template>