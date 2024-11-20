import { ref } from "vue";

import { defineStore } from 'pinia';

export const useFileStore = defineStore('files', () => {
    const _file = ref<File | null>(null);

    function setFile(file: File|null) {
        _file.value = file;
    }

    function getFile() {
        return _file.value;
    }

    return { setFile, getFile };
});
