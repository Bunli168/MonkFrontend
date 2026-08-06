<template>
    <div class="d-flex flex-column gap-4 pt-2">
        
        <!-- Success State -->
        <div v-if="scannedData && !isError" class="text-center py-5 animation-fade-in">
            <div class="mb-4 mx-auto d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle shadow-sm" style="width: 90px; height: 90px; transition: transform 0.3s ease;">
                <i class="fas fa-check fa-3x"></i>
            </div>
            <h3 class="fw-bold text-dark mb-2">Scan Successful!</h3>
            <p class="text-muted mb-4 fs-6">You have been marked as present for today.</p>
            
            <div class="bg-surface rounded-4 p-4 text-start d-inline-block shadow-sm border mb-4" style="min-width: 280px;">
                <div class="small text-muted text-uppercase fw-bold mb-3 tracking-wide">Attendance Details</div>
                <div class="fs-4 fw-bold text-primary mb-3">{{ scannedData.name }}</div>
                <div class="d-flex align-items-center gap-4 text-dark fw-medium">
                    <div class="d-flex align-items-center gap-2"><div class="bg-light p-2 rounded-circle"><i class="fas fa-chair text-muted"></i></div>Row {{ scannedData.row }}</div>
                    <div class="d-flex align-items-center gap-2"><div class="bg-light p-2 rounded-circle"><i class="fas fa-user text-muted"></i></div>Seat {{ scannedData.seat }}</div>
                </div>
            </div>
            
            <div class="mt-2">
                <BaseButton variant="primary" class="px-5 py-2 shadow-sm rounded-pill" @click="confirmScan">
                    Done
                </BaseButton>
            </div>
        </div>
        
        <!-- Scanner State -->
        <div v-else class="d-flex flex-column align-items-center w-100">
            <div class="w-100 position-relative mb-4" style="max-width: 450px; aspect-ratio: 1; border-radius: 20px; overflow: hidden; background-color: var(--surface-ground); border: 2px solid rgba(var(--bs-primary-rgb), 0.1); box-shadow: inset 0 0 20px rgba(0,0,0,0.05);">
                <div id="qr-reader" style="width: 100%; height: 100%;"></div>
                
                <!-- Placeholder when camera is off -->
                <div v-if="!isScanning" class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style="background: rgba(0,0,0,0.02); backdrop-filter: blur(4px);">
                    <div class="bg-white p-4 rounded-circle shadow-sm mb-3 text-muted">
                        <i class="fas fa-qrcode fa-2x"></i>
                    </div>
                    <span class="text-muted fw-medium">Camera is offline</span>
                    <span class="text-muted small mt-1">Tap the button below to start scanning</span>
                </div>
                
                <!-- Scanning Overlay Guidelines -->
                <div v-if="isScanning" class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none d-flex align-items-center justify-content-center">
                    <div style="width: 75%; height: 75%; border: 2px solid rgba(255,255,255,0.4); border-radius: 16px; box-shadow: 0 0 0 9999px rgba(0,0,0,0.4);">
                        <!-- Corner brackets for modern feel -->
                        <div class="position-absolute top-0 start-0 border-top border-start border-white border-4" style="width: 30px; height: 30px; border-top-left-radius: 14px; transform: translate(-2px, -2px);"></div>
                        <div class="position-absolute top-0 end-0 border-top border-end border-white border-4" style="width: 30px; height: 30px; border-top-right-radius: 14px; transform: translate(2px, -2px);"></div>
                        <div class="position-absolute bottom-0 start-0 border-bottom border-start border-white border-4" style="width: 30px; height: 30px; border-bottom-left-radius: 14px; transform: translate(-2px, 2px);"></div>
                        <div class="position-absolute bottom-0 end-0 border-bottom border-end border-white border-4" style="width: 30px; height: 30px; border-bottom-right-radius: 14px; transform: translate(2px, 2px);"></div>
                    </div>
                </div>
            </div>
            
            <div v-if="isError && scanResult" class="w-100 p-3 rounded-3 mb-4 text-center bg-danger bg-opacity-10 text-danger border border-danger">
                <div class="d-flex align-items-center justify-content-center gap-2">
                    <i class="fas fa-exclamation-circle"></i>
                    <span class="fw-bold">{{ scanResult }}</span>
                </div>
            </div>
            
            <div class="text-center d-flex justify-content-center gap-3">
                <BaseButton variant="primary" class="px-4 py-2 shadow-sm rounded-pill d-flex align-items-center gap-2" @click="startScanner" v-if="!isScanning">
                    <i class="fas fa-camera"></i> <span>Open Camera</span>
                </BaseButton>
                <template v-if="isScanning">
                    <BaseButton variant="outline-danger" class="px-4 py-2 rounded-pill d-flex align-items-center gap-2" @click="stopScanner">
                        <i class="fas fa-stop"></i> <span>Stop</span>
                    </BaseButton>
                    <BaseButton variant="outline-secondary" class="px-4 py-2 rounded-pill d-flex align-items-center gap-2" @click="flipCamera">
                        <i class="fas fa-sync-alt"></i> <span>Flip</span>
                    </BaseButton>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';
import api from '@/api/api';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/base/BaseButton.vue';

const toast = useToastStore();
const authStore = useAuthStore();
const emit = defineEmits(['close']);

const scanResult = ref('');
const scannedData = ref(null);
const isError = ref(false);
const isScanning = ref(false);
const isProcessing = ref(false);
const currentFacingMode = ref('environment');
let html5QrCode = null;

const startScanner = async () => {
    isScanning.value = true;
    scanResult.value = '';
    scannedData.value = null;
    
    html5QrCode = new Html5Qrcode("qr-reader");
    try {
        await html5QrCode.start(
            { facingMode: currentFacingMode.value },
            {
                fps: 10,
                aspectRatio: 1.0
            },
            onScanSuccess,
            onScanFailure
        );
    } catch (err) {
        isError.value = true;
        scanResult.value = 'Failed to access camera. Please allow camera permissions.';
        isScanning.value = false;
        console.error(err);
    }
};

const stopScanner = async () => {
    if (html5QrCode && html5QrCode.isScanning) {
        await html5QrCode.stop();
        html5QrCode.clear();
    }
    isScanning.value = false;
};

const flipCamera = async () => {
    if (isScanning.value) {
        await stopScanner();
        currentFacingMode.value = currentFacingMode.value === 'environment' ? 'user' : 'environment';
        await startScanner();
    }
};

const onScanSuccess = async (decodedText, decodedResult) => {
    if (isProcessing.value) return;
    isProcessing.value = true;
    
    try {
        const data = JSON.parse(decodedText);
        
        if (!data.token || !data.seating_row_id || !data.date) {
            throw new Error('Invalid QR Code format.');
        }
        
        // Stop scanning to process
        await stopScanner();
        
        const res = await api.post('/attendances/scan-self', data);
        if (res.data.success) {
            isError.value = false;
            scanResult.value = res.data.message || 'Successfully marked as Present!';
            scannedData.value = res.data.data;
            toast.showToast('Successfully marked present!', 'success');
        }
    } catch (error) {
        isError.value = true;
        scanResult.value = error.response?.data?.message || error.message || 'Failed to process QR code.';
        toast.showToast('Scan failed', 'error');
        // Restart scanner after 3 seconds on error
        setTimeout(() => {
            if (!isScanning.value && !scanResult.value.includes('Present')) {
                startScanner();
            }
        }, 3000);
    } finally {
        isProcessing.value = false;
    }
};

const onScanFailure = (error) => {
    // This is called constantly when no QR code is in frame, just ignore.
};

const confirmScan = () => {
    emit('close');
};

onUnmounted(() => {
    stopScanner();
});
</script>

<style scoped>
#qr-reader video {
    object-fit: cover !important;
}
</style>
