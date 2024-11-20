<script setup lang="ts">
// Core
import { ref, onMounted, computed } from 'vue';

// Store
import { useFileStore } from "@/stores/fileStore";

// Components
import EdsButton from '@/buttons/EdsButton.vue';

// Utils
import { signFile } from '@/utils/crypto';

// Third party lib
import { PDFDocument } from 'pdf-lib';

// Store
const fileStore = useFileStore();
const file = fileStore.getFile();

// Data
let signatureContext: CanvasRenderingContext2D | null = null;
let isDrawing: boolean = false;
const signatureCanvas = ref<HTMLCanvasElement | null>(null);

const clearTitle = "Clear";
const saveSignatureTitle = "Save signature";

let supportsPassive = false;
const keys: { [key: number]: number } = { 37: 1, 38: 1, 39: 1, 40: 1 };
const wheelOpt: boolean | AddEventListenerOptions = supportsPassive ? ({ passive: false } as AddEventListenerOptions) : false;
const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// Reactive
const isSave = ref(false);
const fileUrl = ref("");
const errorMsg = ref("");
const isIosOrSafari = ref(false);

const userAgent = navigator.userAgent;
isIosOrSafari.value = /iPhone|iPad|iPod|Macintosh/.test(userAgent) && /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

// Computed
const signedFileName = computed(() => {

    const nameWithoutExtension = file?.name.replace(/\.[^.]+$/, "") ?? "document_checked";

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${nameWithoutExtension}_signed-${month}-${day}.pdf`;
});



const startDrawing = (event: MouseEvent | TouchEvent) => {
    if (signatureContext && signatureCanvas.value) {
        disableScroll();
        isDrawing = true;
        const offsetX = event instanceof MouseEvent ? event.offsetX : event.touches[0].clientX - signatureCanvas.value.getBoundingClientRect().left;
        const offsetY = event instanceof MouseEvent ? event.offsetY : event.touches[0].clientY - signatureCanvas.value.getBoundingClientRect().top;
        signatureContext.moveTo(offsetX, offsetY);
        signatureContext.beginPath();
    }
};

const stopDrawing = () => {
    if (isDrawing) {
        isDrawing = false;
        signatureContext?.closePath();
    }
};

const draw = (event: MouseEvent | TouchEvent) => {
    if (isDrawing && signatureContext && signatureCanvas.value) {
        event.preventDefault();
        const offsetX = event instanceof MouseEvent ? event.offsetX : event.touches[0].clientX - signatureCanvas.value.getBoundingClientRect().left;
        const offsetY = event instanceof MouseEvent ? event.offsetY : event.touches[0].clientY - signatureCanvas.value.getBoundingClientRect().top;
        signatureContext.lineTo(offsetX, offsetY);
        signatureContext.stroke();
    }
};

const clearSignature = () => {
    if (signatureContext && signatureCanvas.value) {
        signatureContext.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
    }
};


const saveSignature = async () => {
    isSave.value = false;

    if (signatureCanvas.value) {
        const dataURL = signatureCanvas.value.toDataURL();

        if (file) {
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const pages = pdfDoc.getPages();
            const lastPage = pages[pages.length - 1];

            const imgBytes = await fetch(dataURL).then((res) => res.arrayBuffer());
            const img = await pdfDoc.embedPng(imgBytes);

            const { width, height } = img.size();
            const scaleFactor = 0.5;
            const newWidth = width * scaleFactor;
            const newHeight = height * scaleFactor;

            lastPage.drawImage(img, {
                x: lastPage.getWidth() - newWidth,
                y: 0,
                width: newWidth,
                height: newHeight,
            });

            const pdfBytesWithSignImage = await pdfDoc.save();

            const pdfBlobWithSignImage = new Blob([pdfBytesWithSignImage], { type: "application/pdf" });
            const pdfFileWithSignImage = new File([pdfBlobWithSignImage], "signed_document.pdf");


            try {
                fileUrl.value = await signFile(pdfFileWithSignImage);
                isSave.value = true;

            } catch (err) {
                (err as Error).message = (err as Error).message ?? "Error signing file";
            }
        }
    }
};


// On Mounted
onMounted(() => {

    // signature
    if (signatureCanvas.value) {
        signatureContext = signatureCanvas.value.getContext('2d');
        signatureContext?.beginPath();

        signatureCanvas.value.addEventListener('mousedown', startDrawing);

        signatureCanvas.value.addEventListener('mousedown', disableScroll);

        signatureCanvas.value.addEventListener('mousemove', draw);

        signatureCanvas.value.addEventListener('mousemove', disableScroll);

        // signatureCanvas.value.addEventListener('mouseup', enableScroll);

        signatureCanvas.value.addEventListener('mouseup', stopDrawing);

        signatureCanvas.value.addEventListener('mouseout', stopDrawing);

        // signatureCanvas.value.addEventListener('mouseout', enableScroll);


        signatureCanvas.value.addEventListener('touchstart', startDrawing);

        signatureCanvas.value.addEventListener('touchstart', disableScroll);


        signatureCanvas.value.addEventListener('touchmove', draw);

        signatureCanvas.value.addEventListener('touchmove', disableScroll);

        signatureCanvas.value.addEventListener('touchend', stopDrawing);


        signatureCanvas.value.addEventListener('touchcancel', stopDrawing);

        // signatureCanvas.value.addEventListener('touchcancel', enableScroll);


        const resizeObserver = new ResizeObserver(() => {
            if (signatureCanvas.value) {
                const parentWidth = signatureCanvas.value.parentElement?.offsetWidth || 500;
                signatureCanvas.value.width = parentWidth + 22;
            }
        });

        if (signatureCanvas.value.parentElement) {
            resizeObserver.observe(signatureCanvas.value.parentElement);
        }
    }

    // scroll 
    // Modern Chrome requires { passive: false } when adding an event
    try {
        window.addEventListener("test", null as any, Object.defineProperty({}, 'passive', {
            get: function () { supportsPassive = true; }
        }));
    } catch (e) { }
});


function preventDefault(e: Event): void {
    e.preventDefault();
}

function preventDefaultForScrollKeys(e: KeyboardEvent): boolean | void {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll(): void {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // Older Firefox
    window.addEventListener(wheelEvent, preventDefault, wheelOpt); // Modern desktop
    window.addEventListener('touchmove', preventDefault, wheelOpt); // Mobile
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

function enableScroll(): void {
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
    window.removeEventListener('touchmove', preventDefault, wheelOpt);
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

const handleDownload = () => {
    const a = document.createElement('a');
    a.href = fileUrl.value;
    a.download = signedFileName.value;

    if (a.download !== undefined) {
        a.click();
    } else {
        window.open(fileUrl.value, '_blank');
    }
};
</script>

<template>
    <div class="max-w-[50rem] pr-4 pl-4 pt-2">
        <div class="">
            <canvas ref="signatureCanvas" class="mb-5 block w-full h-auto border-2 border-solid border-[#ccc]"
                height="200" />
        </div>

        <div class="flex flex-row space-x-4 px-1">
            <EdsButton :title="clearTitle" @click="clearSignature" />
            <EdsButton :title="saveSignatureTitle" @click="saveSignature" />
        </div>

        <p v-if="isSave">
            <a v-if="isIosOrSafari" @click="handleDownload" href="javascript:void(0);" type="application/pdf" download>
                {{ signedFileName }}
            </a>

            <a v-else :href="fileUrl" target="_blank" type="application/pdf" download>
                {{ signedFileName }}
            </a>
        </p>
        <p v-if="!!errorMsg">
            {{ errorMsg }}
        </p>
    </div>

</template>
