<script setup lang="ts">
// Core
import {
    computed,
    onMounted,
    ref,
} from "vue";

// Router
import { useRouter } from "vue-router";

// Stores
import { useFileStore } from "@/stores/fileStore";
import { useCryptoStore } from "@/stores/cryptoStore";

// Component
import Upload from "@/components/Upload.vue";

//Utils 
import { verifyFile } from "@/utils/crypto";
import { getKeys, setInitializationFlag, getInitializationFlag } from "@/utils/index_db";

//router
const router = useRouter();

// stores
const fileStore = useFileStore();

// Reactivity
const fileRef = ref<File | null>(null);
const isChecked = ref<boolean>(false);
const signatureValid = ref<boolean>(false);
const errorMsg = ref<string>("");
const fileUrl = ref<string>();

// Computed
const checkedFileName = computed(() => {
    const nameWithoutExtension = fileRef.value?.name.replace(/\.[^.]+$/, "") ?? "document_checked";

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${nameWithoutExtension}_checked-${month}-${day}.pdf`;
});



const fileProcess = (file: File) => {
    fileRef.value = file;

    fileStore.setFile(fileRef.value);

    router.push({ name: 'sign', replace: true });
}

const checkSignature = async (file: File) => {
    fileRef.value = file;
    isChecked.value = true;
    signatureValid.value = false;
    errorMsg.value = "";

    try {
        fileUrl.value = await verifyFile(file);
        const cryptoStore = useCryptoStore();

        signatureValid.value = true;
    } catch (err) {
        if ((err as Error).message === "Signature verification failed.") {
            errorMsg.value = "Invalid signature.";
        } else if ((err as Error).message === "Key pair not available for verification.") {
            errorMsg.value = (err as Error).message;
        }
        else {
            errorMsg.value = `Something went wrong verifying`;
        }
    }
};


onMounted(async () => {
    const fileStore = useFileStore();
    fileStore.setFile(null);

    const cryptoStore = useCryptoStore();

    try {
        const isKeys = await getInitializationFlag(); // Ожидаем выполнения Promise

        if (!isKeys) {
            await setInitializationFlag(); // Устанавливаем флаг
            await cryptoStore.generateKeyPair(); // Генерируем ключи
            return;
        }

        const pubKey = cryptoStore.getPublicKey();

        if (pubKey !== null) {
            return;
        }

        const { publicKey, privateKey } = await getKeys(); // Ожидаем получения ключей
        cryptoStore.setKeyPair(publicKey, privateKey); // Устанавливаем ключи в store
    } catch (error) {
        console.error("Failed to initialize keys or handle crypto store:", error);
    }
});
</script>

<template>
    <div class="flex h-[100vh] justify-center flex-col gap-4 sm:gap-2 px-4 sm:p-2 ">
        <div class="flex-row mr-4 ml-4">
            <Upload :title="'Sign PDF Document'" @upload:file="fileProcess" />
        </div>

        <div class="flex-row mr-4 ml-4">
            <Upload :title="'Verify the Document'" @upload:file="checkSignature" />
        </div>


        <div v-if="isChecked" class="mt-4 sm:mt-2">
            <p class="text-lg sm:text-base font-medium pr-4 pl-4 pt-2">
                Signature is
                <span class="" :class="signatureValid ? 'text-green-600' : 'text-red-600'">
                    {{ signatureValid ? "valid" : "invalid" }}.
                </span>
            </p>
            <div class="mt-2 pr-4 pl-4 pt-2">
                <a v-if="signatureValid" :href="fileUrl" :download="checkedFileName" target="_blank"
                    type="application/pdf" class="text-blue-600 underline hover:text-blue-800">
                    {{ checkedFileName }}
                </a>
            </div>
        </div>

        <p v-if="!!errorMsg" class="text-red-600 mt-2 pr-4 pl-4 pt-2 sm:text-sm">
            {{ errorMsg }}
        </p>
    </div>
</template>
